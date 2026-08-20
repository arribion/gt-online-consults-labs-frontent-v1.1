import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Ban, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  ConfirmDialog,
  DataTable,
  PageHeader,
  Panel,
  PanelHeader,
  SelectFilter,
  StatusBadge,
  TextField,
  type Column,
} from "@/components/common";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useAuth } from "@/hooks/useAuth";
import { useAllProjects, useMembers } from "@/hooks/useLookups";
import { invoicesService } from "@/services";
import { formatCurrency, formatDate, formatMinutes, minutesToHours } from "@/lib/format";
import {
  INVOICE_TRANSITIONS,
  invoiceBilledMinutes,
  invoiceCarryOverItems,
  type Invoice,
  type InvoiceItem,
  type InvoiceTransition,
} from "@/types";

const itemColumns: Column<InvoiceItem>[] = [
  {
    key: "task_id",
    header: "Task ID",
    mobile: "primary",
    sortValue: (item) => item.task_id,
    cell: (item) => <span className="font-mono text-xs">{item.task_id}</span>,
  },
  {
    key: "account",
    header: "Account",
    sortValue: (item) => item.account,
    cell: (item) => (
      <span className="rounded border border-line2/60 bg-ink2 px-1.5 py-0.5 text-[11px] font-semibold text-sky2">
        {item.account}
      </span>
    ),
  },
  {
    key: "task_date",
    header: "Date",
    sortValue: (item) => item.task_date,
    cell: (item) => <span className="whitespace-nowrap">{formatDate(item.task_date)}</span>,
  },
  {
    key: "duration",
    header: "Duration",
    align: "right",
    cell: (item) => <span className="text-xs text-mist">{item.duration_display}</span>,
  },
  {
    key: "cap",
    header: "Cap",
    align: "right",
    cell: (item) => <span className="text-xs text-mist">{item.cap_minutes}m</span>,
  },
  {
    key: "paid",
    header: "Billed",
    align: "right",
    mobile: "secondary",
    sortValue: (item) => item.paid_minutes,
    cell: (item) => <span className="font-semibold text-frost">{item.paid_minutes}m</span>,
  },
];

/**
 * The invoice document, shared by both roles.
 *
 * Every figure here is a frozen snapshot taken when the invoice was generated —
 * a dispute settled afterwards never rewrites an issued invoice — so the line
 * items and the exclusion counts are shown as recorded, not recomputed.
 */
export default function InvoiceDetail() {
  const { invoiceId = "" } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data, loading, error, refetch, setData } = useAsync<Invoice | null>(
    () => invoicesService.get(invoiceId),
    [invoiceId],
    null,
  );

  // GET /projects is readable by any signed-in user, so one lookup serves both
  // roles; the member list is admin-gated and stays off for a tasker.
  const { nameById: projectNames } = useAllProjects();
  const { nameById: memberNames } = useMembers({ enabled: isAdmin });

  const [status, setStatus] = useState<string>("");
  const [voiding, setVoiding] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  const { mutate: updateStatus, pending } = useMutation(
    (next: InvoiceTransition) => invoicesService.setStatus(invoiceId, next),
    { success: "Invoice status updated.", onDone: (invoice) => setData(invoice) },
  );

  const { mutate: voidInvoice, pending: voidPending } = useMutation(
    () => invoicesService.invalidate(invoiceId, voidReason.trim()),
    {
      success: "Invoice voided — its work is unbilled again.",
      onDone: (invoice) => {
        setData(invoice);
        setVoiding(false);
        setVoidReason("");
      },
    },
  );

  const backTo = isAdmin ? "/admin/invoices" : "/client/invoices";

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-mist">
        <Link to={backTo}>
          <ArrowLeft className="h-3.5 w-3.5" /> All invoices
        </Link>
      </Button>

      <AsyncSection loading={loading} error={error} onRetry={refetch} isEmpty={!data}>
        {data && (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Invoice"
              title={data.external_id}
              description={`${projectNames.get(data.project_id ?? "") ?? "Project"} · ${formatDate(
                data.period_start,
              )} – ${formatDate(data.period_end)}`}
              actions={
                <>
                  <StatusBadge status={data.status} />
                  <Button onClick={() => void invoicesService.downloadPdf(data)}>
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </>
              }
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <Panel className="lg:col-span-2">
                <PanelHeader
                  title="Billed tasks"
                  description={`${data.items?.length ?? 0} line items, ${formatMinutes(
                    invoiceBilledMinutes(data),
                  )} billable.`}
                />

                {invoiceCarryOverItems(data).length > 0 && (
                  <p className="mt-3 rounded-lg border border-azure/40 bg-azure/10 px-3 py-2.5 text-sm text-mist">
                    <span className="font-semibold text-frost">
                      {invoiceCarryOverItems(data).length} task
                      {invoiceCarryOverItems(data).length === 1 ? "" : "s"} carried over
                    </span>{" "}
                    from before {formatDate(data.period_start)}. These were held back when their own
                    period was billed — usually under dispute at the time — and became billable
                    afterwards, so they are settled here.
                  </p>
                )}
                <div className="mt-4">
                  <DataTable
                    rows={data.items ?? []}
                    columns={itemColumns}
                    getRowKey={(item) => `${item.task_id}-${item.task_date}`}
                    pageSize={20}
                    emptyLabel="This invoice has no line items."
                  />
                </div>
              </Panel>

              <div className="space-y-4">
                <Panel>
                  <PanelHeader title="Totals" />
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <Row label="Billable hours" value={`${minutesToHours(invoiceBilledMinutes(data))} h`} />
                    <Row
                      label="Rate"
                      value={data.rate != null ? `${formatCurrency(data.rate)}/hr` : "—"}
                    />
                    <Row label="Subtotal" value={formatCurrency(data.subtotal)} />
                    <Row
                      label="Payment rate"
                      value={data.payment_rate != null ? `${data.payment_rate}%` : "—"}
                    />
                    {!!data.adjustments && (
                      <Row label="Adjustments" value={formatCurrency(data.adjustments)} />
                    )}
                    <div className="flex items-baseline justify-between border-t border-line pt-3">
                      <dt className="text-sm font-semibold text-frost">Total</dt>
                      <dd className="font-display text-xl font-bold tabular-nums text-sky2">
                        {formatCurrency(data.total)}
                      </dd>
                    </div>
                  </dl>
                </Panel>

                {!!data.adjustment_detail?.length && (
                  <Panel className="border-warn/40 bg-warn/[0.06]">
                    <PanelHeader
                      title="Deducted from this invoice"
                      description="Work that was paid on an earlier invoice and has since been awarded to someone else. The earlier invoice is never rewritten — the amount is recovered here instead."
                    />
                    <dl className="mt-3 space-y-2 text-sm">
                      {data.adjustment_detail.map((line) => (
                        <Row
                          key={line.adjustment_id}
                          label={line.task_id ? `Task ${line.task_id}` : "Adjustment"}
                          value={`-${formatCurrency(line.amount)}`}
                        />
                      ))}
                    </dl>
                    {data.adjustment_detail.some((line) => line.outstanding_after > 0) && (
                      <p className="mt-3 text-xs text-mist">
                        Part of this is still outstanding and carries to the next invoice — an
                        invoice is never taken below zero.
                      </p>
                    )}
                  </Panel>
                )}

                {data.status === "Invalidated" && (
                  <Panel className="border-bad/40 bg-bad/[0.06]">
                    <PanelHeader
                      title="This invoice was voided"
                      description={data.invalidated_reason ?? undefined}
                    />
                    <p className="mt-2 text-sm text-mist">
                      Voided {formatDate(data.invalidated_at)}. The work it covered was released and
                      will appear on a later invoice if it is still billable. Voiding is permanent —
                      this document stays on record showing why.
                    </p>
                  </Panel>
                )}

                {!!data.exclusions?.count && (
                  <Panel className="border-warn/40 bg-warn/[0.06]">
                    <PanelHeader
                      title="Excluded from this invoice"
                      description={`${data.exclusions.count} task${
                        data.exclusions.count === 1 ? "" : "s"
                      } fell in the period but weren't billable.`}
                    />
                    <dl className="mt-3 space-y-2 text-sm">
                      <Row label="Disputed" value={data.exclusions.disputed} />
                      <Row label="Forfeited" value={data.exclusions.forfeited} />
                      <Row label="Not completed" value={data.exclusions.not_completed} />
                    </dl>
                  </Panel>
                )}

                <Panel>
                  <PanelHeader title="Record" />
                  <dl className="mt-3 space-y-2.5 text-sm">
                    {isAdmin && (
                      <Row
                        label="Tasker"
                        value={memberNames.get(data.party_id ?? "") ?? data.party_id ?? "—"}
                      />
                    )}
                    <Row label="Issued" value={formatDate(data.issued_at)} />
                    <Row label="Paid" value={formatDate(data.paid_at)} />
                    <Row label="Created" value={formatDate(data.created_at)} />
                  </dl>

                  {isAdmin && data.status !== "Invalidated" && (
                    <div className="mt-4 space-y-3 border-t border-line pt-4">
                      <SelectFilter
                        label="Change status"
                        value={status || data.status}
                        onChange={(next) => {
                          setStatus(next);
                          void updateStatus(next as InvoiceTransition);
                        }}
                        allLabel={null}
                        options={INVOICE_TRANSITIONS.map((value) => ({ value, label: value }))}
                        className="w-full"
                      />
                      {pending && <p className="text-xs text-mist">Saving…</p>}
                      <p className="text-xs text-dim">
                        Marking an invoice paid is refused while it bills a contested task — settle
                        the dispute first, or the money has to be recovered afterwards.
                      </p>
                      {data.status !== "Paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-bad/40 text-bad hover:bg-bad/10"
                          onClick={() => setVoiding(true)}
                        >
                          <Ban className="h-3.5 w-3.5" /> Void this invoice
                        </Button>
                      )}
                    </div>
                  )}
                </Panel>
              </div>
            </div>
          </div>
        )}
      </AsyncSection>

      <ConfirmDialog
        open={voiding}
        onOpenChange={(next) => !next && setVoiding(false)}
        title="Void this invoice?"
        confirmLabel="Void invoice"
        pending={voidPending}
        disabled={voidReason.trim().length < 3}
        message={
          <>
            <p>
              This is permanent. The invoice stays on record marked as voided, and the tasks it
              billed become unbilled again — they will appear on a later invoice if they are still
              this tasker's to bill.
            </p>
            <TextField
              label="Reason"
              required
              className="mt-3"
              value={voidReason}
              onChange={(event) => setVoidReason(event.target.value)}
              placeholder="e.g. Billed against the wrong period"
              hint="The tasker is told, with this reason."
            />
          </>
        }
        onConfirm={() => voidInvoice()}
      />

      {!loading && !data && !error && (
        <Panel>
          <p className="text-sm text-mist">
            That invoice doesn't exist, or it isn't yours to view.{" "}
            <button onClick={() => navigate(backTo)} className="text-sky2 underline-offset-4 hover:underline">
              Back to invoices
            </button>
          </p>
        </Panel>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-mist">{label}</dt>
      <dd className="truncate text-right font-medium tabular-nums text-frost">{value}</dd>
    </div>
  );
}
