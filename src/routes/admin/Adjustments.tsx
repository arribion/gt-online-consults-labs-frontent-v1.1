import { useMemo, useState } from "react";
import {
  BadgeAlert,
  Check,
  CircleDollarSign,
  Clock,
  Scale,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SelectFilter,
  StatCard,
  StatGrid,
  TextField,
  type Column,
} from "@/components/common";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useAuth } from "@/hooks/useAuth";
import { useMembers } from "@/hooks/useLookups";
import { adjustmentsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  ADJUSTMENT_STATUSES,
  ADJUSTMENT_STATUS_LABEL,
  isAdjustmentOpen,
  isUncollectable,
  type Adjustment,
  type AdjustmentStatus,
  type AdjustmentSummary,
} from "@/types";

const STATUS_OPTIONS = ADJUSTMENT_STATUSES.map((value) => ({
  value,
  label: ADJUSTMENT_STATUS_LABEL[value],
}));

/**
 * Money owed back after a paid invoice turned out to bill someone else's work.
 *
 * This screen exists because the alternative is invisible money. An adjustment
 * that nobody approves never applies; one nobody writes off sits on the list
 * for good, and a list that only grows stops being read. So the two derived
 * flags — sitting too long, and no live assignment to deduct from — are shown
 * as first-class figures rather than left for someone to work out per row.
 */
export default function AdminAdjustments() {
  const { user } = useAuth();
  const { taskerOptions } = useMembers();
  const isSuperadmin = user?.role === "SUPERADMIN";

  const [status, setStatus] = useState("");
  const [taskerId, setTaskerId] = useState("");
  const [approving, setApproving] = useState<Adjustment | null>(null);
  const [closing, setClosing] = useState<{ row: Adjustment; mode: "write-off" | "cancel" } | null>(
    null,
  );
  const [reason, setReason] = useState("");

  const { data, loading, error, refetch } = useAsync<Adjustment[]>(
    () =>
      adjustmentsService.list({
        status: (status || undefined) as AdjustmentStatus | undefined,
        taskerId: taskerId || undefined,
      }),
    [status, taskerId],
    [],
  );

  const { data: summary, refetch: refetchSummary } = useAsync<AdjustmentSummary | null>(
    () => adjustmentsService.summary(),
    [],
    null,
  );

  const reload = () => {
    void refetch();
    void refetchSummary();
  };

  const { mutate: approve, pending: approvePending } = useMutation(
    (row: Adjustment) => adjustmentsService.approve(row.id),
    {
      success: "Approved — it comes off their next invoice.",
      onDone: () => {
        reload();
        setApproving(null);
      },
    },
  );

  const { mutate: close, pending: closePending } = useMutation(
    () =>
      closing!.mode === "write-off"
        ? adjustmentsService.writeOff(closing!.row.id, reason.trim())
        : adjustmentsService.cancel(closing!.row.id, reason.trim()),
    {
      success: "Closed.",
      onDone: () => {
        reload();
        setClosing(null);
        setReason("");
      },
    },
  );

  const open = useMemo(() => data.filter(isAdjustmentOpen), [data]);

  const columns: Column<Adjustment>[] = [
    {
      key: "tasker",
      header: "Tasker",
      mobile: "primary",
      sortValue: (row) => row.tasker_name ?? "",
      cell: (row) => (
        <div>
          <span className="font-semibold text-frost">{row.tasker_name ?? "Unknown"}</span>
          {isUncollectable(row) && (
            <p className="flex items-center gap-1 text-[11px] text-bad">
              <UserX className="h-3 w-3" /> no active assignment
            </p>
          )}
        </div>
      ),
    },
    {
      key: "task",
      header: "Task",
      sortValue: (row) => row.task_id ?? "",
      cell: (row) => (
        <div className="text-sm">
          <span className="font-mono text-xs">{row.task_id ?? "—"}</span>
          <p className="text-[11px] text-dim">
            {row.project_name ?? "—"}
            {row.source_invoice_number ? ` · ${row.source_invoice_number}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Owed",
      align: "right",
      mobile: "secondary",
      sortValue: (row) => row.outstanding,
      cell: (row) => (
        <div className="text-right">
          <span className="font-semibold tabular-nums text-frost">
            {formatCurrency(row.outstanding)}
          </span>
          {row.applied_amount > 0 && (
            <p className="text-[11px] text-dim">
              {formatCurrency(row.applied_amount)} of {formatCurrency(row.amount)} recovered
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => (
        <span className="text-xs text-mist">{ADJUSTMENT_STATUS_LABEL[row.status]}</span>
      ),
    },
    {
      key: "age",
      header: "Raised",
      align: "right",
      sortValue: (row) => row.created_at,
      cell: (row) => (
        <span className={`whitespace-nowrap text-xs ${row.stale ? "text-warn" : "text-mist"}`}>
          {formatDate(row.created_at)}
          {row.stale && <span className="block text-[11px]">{row.age_days} days old</span>}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => {
        if (!isAdjustmentOpen(row)) return null;
        return (
          <div className="flex justify-end gap-1">
            {row.status === "PENDING_APPROVAL" && (
              <Button size="sm" variant="ghost" onClick={() => setApproving(row)}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
            )}
            {row.applied_amount === 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setClosing({ row, mode: "cancel" })}
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            )}
            {isSuperadmin && (
              <Button
                size="sm"
                variant="ghost"
                className="text-bad"
                onClick={() => setClosing({ row, mode: "write-off" })}
              >
                Write off
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const activeFilters = [status, taskerId].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Adjustments"
        description="Work that was paid on an invoice and has since been awarded to someone else. The paid invoice is never rewritten — the amount is deducted from the tasker's next one instead."
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard
          label="Outstanding"
          value={formatCurrency(summary?.total_outstanding ?? 0)}
          tone={summary?.total_outstanding ? "warn" : "default"}
          hint={`${summary?.open_count ?? 0} open`}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Awaiting approval"
          value={summary?.pending_approval ?? 0}
          tone={summary?.pending_approval ? "warn" : "default"}
          hint="Nothing is deducted until approved"
          icon={BadgeAlert}
        />
        <StatCard
          label="Going stale"
          value={summary?.stale_count ?? 0}
          tone={summary?.stale_count ? "warn" : "default"}
          hint="Older than 30 days"
          icon={Clock}
        />
        <StatCard
          label="Likely uncollectable"
          value={summary?.uncollectable_count ?? 0}
          tone={summary?.uncollectable_count ? "bad" : "default"}
          hint="No live assignment to deduct from"
          icon={UserX}
        />
      </StatGrid>

      <Panel className="space-y-4">
        <FilterBar
          active={activeFilters}
          onReset={() => {
            setStatus("");
            setTaskerId("");
          }}
        >
          <SelectFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            allLabel="Any status"
          />
          <SelectFilter
            label="Tasker"
            value={taskerId}
            onChange={setTaskerId}
            options={taskerOptions}
            allLabel="Anyone"
          />
        </FilterBar>

        <AsyncSection
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={!data.length}
          empty={
            <EmptyState
              icon={Scale}
              title={activeFilters ? "Nothing matches these filters" : "No adjustments"}
              description="An adjustment only appears when an invoice was paid and its work later turned out to belong to someone else. That should be rare."
            />
          }
        >
          <DataTable
            rows={data}
            columns={columns}
            getRowKey={(row) => row.id}
            pageSize={20}
          />
        </AsyncSection>
      </Panel>

      <ConfirmDialog
        open={!!approving}
        onOpenChange={(next) => !next && setApproving(null)}
        title="Approve this deduction?"
        confirmLabel="Approve"
        tone="default"
        pending={approvePending}
        message={
          approving && (
            <>
              {formatCurrency(approving.outstanding)} will be deducted from{" "}
              <span className="font-semibold text-frost">{approving.tasker_name}</span>'s next
              invoice for {approving.project_name ?? "this project"}. They are told now, so it is
              not a surprise when it lands. An invoice is never taken below zero — anything left
              over carries forward.
            </>
          )
        }
        onConfirm={() => approving && approve(approving)}
      />

      <ConfirmDialog
        open={!!closing}
        onOpenChange={(next) => !next && (setClosing(null), setReason(""))}
        title={closing?.mode === "write-off" ? "Write this off?" : "Cancel this adjustment?"}
        confirmLabel={closing?.mode === "write-off" ? "Write off" : "Cancel adjustment"}
        pending={closePending}
        disabled={reason.trim().length < 3}
        message={
          closing && (
            <>
              <p>
                {closing.mode === "write-off"
                  ? `${formatCurrency(closing.row.outstanding)} will not be recovered. This is the honest end of the story for someone who has left or an amount not worth chasing.`
                  : "The adjustment is retracted as raised in error. Only possible while none of it has been applied."}
              </p>
              <TextField
                label="Reason"
                required
                className="mt-3"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. Tasker has left; amount not worth pursuing"
                hint="Kept on the record, and shown to the tasker."
              />
            </>
          )
        }
        onConfirm={() => close()}
      />

      {open.length > 0 && (
        <p className="text-xs text-dim">
          Deductions apply oldest first, against the project the work was on. If that pairing goes
          quiet — the project closes, the assignment ends, or 30 days pass — any of that tasker's
          invoices can absorb it instead.
        </p>
      )}
    </>
  );
}
