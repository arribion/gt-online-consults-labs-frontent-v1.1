import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Gavel, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  DataTable,
  DateFilter,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SelectFilter,
  StatCard,
  StatGrid,
  StatusBadge,
  type Column,
} from "@/components/common";
import {
  AdjudicateDisputeDialog,
  ExtendDisputeDialog,
} from "@/components/disputes/DisputeAdminDialogs";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useAuth } from "@/hooks/useAuth";
import { useAllProjects, useMembers } from "@/hooks/useLookups";
import { disputesService } from "@/services";
import { formatDate, truncate } from "@/lib/format";
import {
  DISPUTE_STATUSES,
  awaitsAdjudication,
  disputeCountdown,
  disputeProgress,
  disputeUrgency,
  type Dispute,
  type DisputeStatus,
} from "@/types";

const STATUS_OPTIONS = DISPUTE_STATUSES.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

/**
 * Admin view of every contested task.
 *
 * The powers here are deliberately narrow. While a dispute is live the
 * claimants own it and an admin can only buy them more time — stepping in to
 * pick a winner would be the unilateral call the whole withdrawal handshake
 * exists to prevent. Once the window has closed and everything has forfeited,
 * a superadmin can rule on it, because otherwise a claimant who left the
 * company or a mistyped task ID is a permanent loss with no recourse.
 *
 * The awaiting-a-ruling queue matters more than it looks: a late claimant gets
 * no extension, so three-way collisions land here as a matter of course rather
 * than as an exception.
 */
export default function AdminDisputes() {
  const { user } = useAuth();
  const { options: projectOptions, nameById: projectNames } = useAllProjects();
  const { taskerOptions } = useMembers();
  const [extending, setExtending] = useState<Dispute | null>(null);
  const [ruling, setRuling] = useState<Dispute | null>(null);
  const isSuperadmin = user?.role === "SUPERADMIN";

  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskerId, setTaskerId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filters = {
    status: (status || undefined) as DisputeStatus | undefined,
    projectId: projectId || undefined,
    taskerId: taskerId || undefined,
    raisedFrom: from || undefined,
    raisedTo: to || undefined,
  };

  const { data, loading, error, refetch } = useAsync<Dispute[]>(
    () => disputesService.list(filters),
    [status, projectId, taskerId, from, to],
    [],
  );

  const { mutate: exportPdf, pending: exporting } = useMutation(() =>
    disputesService.exportPdf(filters),
  );

  const counts = useMemo(
    () => ({
      pending: data.filter((dispute) => dispute.status === "PENDING").length,
      resolved: data.filter((dispute) => dispute.status === "RESOLVED").length,
      forfeited: data.filter((dispute) => dispute.status === "FORFEITED").length,
      expiring: data.filter(
        (dispute) => dispute.status === "PENDING" && dispute.days_remaining <= 2,
      ).length,
      awaiting: data.filter(awaitsAdjudication).length,
    }),
    [data],
  );

  const columns: Column<Dispute>[] = [
    {
      key: "task_id",
      header: "Task ID",
      mobile: "primary",
      sortValue: (dispute) => dispute.task_id,
      cell: (dispute) => (
        <span className="font-mono text-xs" title={dispute.task_id}>
          {truncate(dispute.task_id, 18)}
        </span>
      ),
    },
    {
      key: "project",
      header: "Project",
      sortValue: (dispute) => projectNames.get(dispute.project_id) ?? "",
      cell: (dispute) => projectNames.get(dispute.project_id) ?? "—",
    },
    {
      key: "parties",
      header: "Claimants",
      sortValue: (dispute) => dispute.claimants[0]?.full_name ?? "",
      cell: (dispute) => (
        // A dispute holds any number of claimants, so they are listed rather
        // than squeezed into a fixed "X vs Y".
        <div className="text-sm">
          {dispute.claimants.map((claimant) => (
            <span key={claimant.id} className="mr-1.5 whitespace-nowrap">
              {claimant.full_name}
              {claimant.withdrawn && <span className="text-dim"> (out)</span>}
            </span>
          ))}
          {dispute.claimants.length > 2 && (
            <p className="text-[11px] text-dim">{disputeProgress(dispute)}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "secondary",
      sortValue: (dispute) => dispute.status,
      cell: (dispute) => <StatusBadge status={dispute.status} size="sm" />,
    },
    {
      key: "outcome",
      header: "Outcome",
      sortValue: (dispute) => dispute.resolved_owner?.full_name ?? "",
      cell: (dispute) => {
        if (dispute.resolved_owner) {
          return <span className="text-sm">{dispute.resolved_owner.full_name}</span>;
        }
        if (awaitsAdjudication(dispute)) {
          return <span className="text-xs font-semibold text-warn">Awaiting a ruling</span>;
        }
        return <span className="text-xs text-dim">Still contested</span>;
      },
    },
    {
      key: "raised_at",
      header: "Raised",
      sortValue: (dispute) => dispute.raised_at,
      cell: (dispute) => (
        <span className="whitespace-nowrap text-xs text-mist">
          {formatDate(dispute.raised_at)}
        </span>
      ),
    },
    {
      key: "deadline",
      header: "Time left",
      align: "right",
      sortValue: (dispute) =>
        dispute.status === "PENDING" ? dispute.hours_remaining : 1_000_000,
      cell: (dispute) => {
        if (dispute.status !== "PENDING") {
          return (
            <span className="text-xs text-dim">
              {formatDate(dispute.resolved_at ?? dispute.forfeited_at)}
            </span>
          );
        }
        const urgency = disputeUrgency(dispute);
        return (
          <span
            className={`whitespace-nowrap text-xs font-semibold ${
              urgency === "calm" ? "text-warn" : "text-bad"
            }`}
          >
            {disputeCountdown(dispute)}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (dispute) =>
        dispute.status === "PENDING" ? (
          <Button size="sm" variant="ghost" onClick={() => setExtending(dispute)}>
            <Timer className="h-3.5 w-3.5" /> Extend
          </Button>
        ) : awaitsAdjudication(dispute) && isSuperadmin ? (
          <Button size="sm" variant="outline" onClick={() => setRuling(dispute)}>
            <Gavel className="h-3.5 w-3.5" /> Rule
          </Button>
        ) : null,
    },
  ];

  const activeFilters = [status, projectId, taskerId, from, to].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Disputes"
        description="More than one tasker logged the same task ID on the same project. The claimants settle it themselves by stepping back; you can give them more time, and rule on it only once the window has closed."
        actions={
          <Button variant="outline" disabled={exporting || !data.length} onClick={() => void exportPdf()}>
            <Download className="h-4 w-4" /> {exporting ? "Preparing…" : "Export PDF"}
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard
          label="Contested"
          value={counts.pending}
          tone={counts.pending ? "warn" : "default"}
          icon={AlertTriangle}
        />
        <StatCard
          label="Expiring in 2 days"
          value={counts.expiring}
          tone={counts.expiring ? "bad" : "default"}
          hint="Nobody is paid if more than one is still claiming"
        />
        <StatCard
          label="Awaiting a ruling"
          value={counts.awaiting}
          tone={counts.awaiting ? "warn" : "default"}
          hint={isSuperadmin ? "You can award or void these" : "A superadmin can settle these"}
          icon={Gavel}
        />
        <StatCard label="Settled" value={counts.resolved} tone="good" icon={CheckCircle2} />
      </StatGrid>

      <Panel className="space-y-4">
        <FilterBar
          active={activeFilters}
          onReset={() => {
            setStatus("");
            setProjectId("");
            setTaskerId("");
            setFrom("");
            setTo("");
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
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
            allLabel="All projects"
          />
          <SelectFilter
            label="Tasker"
            value={taskerId}
            onChange={setTaskerId}
            options={taskerOptions}
            allLabel="Anyone"
          />
          <DateFilter label="Raised from" value={from} onChange={setFrom} max={to || undefined} />
          <DateFilter label="Raised to" value={to} onChange={setTo} min={from || undefined} />
        </FilterBar>

        <AsyncSection
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={!data.length}
          empty={
            <EmptyState
              icon={ShieldCheck}
              title={activeFilters ? "Nothing matches these filters" : "No disputes on record"}
              description={
                activeFilters
                  ? "Try clearing a filter."
                  : "Nobody has logged a task ID that collided with another tasker's."
              }
            />
          }
        >
          <DataTable
            rows={data}
            columns={columns}
            getRowKey={(dispute) => dispute.id}
            pageSize={20}
          />
        </AsyncSection>
      </Panel>

      <ExtendDisputeDialog
        dispute={extending}
        onClose={() => setExtending(null)}
        onDone={() => void refetch()}
      />
      <AdjudicateDisputeDialog
        dispute={ruling}
        onClose={() => setRuling(null)}
        onDone={() => void refetch()}
      />
    </>
  );
}
