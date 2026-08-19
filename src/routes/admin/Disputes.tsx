import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ShieldCheck, XCircle } from "lucide-react";
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
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useAllProjects, useMembers } from "@/hooks/useLookups";
import { disputesService } from "@/services";
import { formatDate, truncate } from "@/lib/format";
import {
  DISPUTE_STATUSES,
  disputeDaysRemaining,
  type Dispute,
  type DisputeStatus,
} from "@/types";

const STATUS_OPTIONS = DISPUTE_STATUSES.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

/**
 * Admin view of every dispute.
 *
 * Admins can't resolve a dispute — only the two parties can, by claim and
 * confirm — so this page is about visibility and chasing: who's involved, how
 * long is left, and a PDF of the current filter to take into a conversation.
 */
export default function AdminDisputes() {
  const { options: projectOptions, nameById: projectNames } = useAllProjects();
  const { taskerOptions } = useMembers();

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
        (dispute) => dispute.status === "PENDING" && disputeDaysRemaining(dispute.raised_at) <= 2,
      ).length,
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
      header: "Between",
      sortValue: (dispute) => dispute.user_1.full_name,
      cell: (dispute) => (
        <span className="text-sm">
          {dispute.user_1.full_name} <span className="text-dim">vs</span>{" "}
          {dispute.user_2.full_name}
        </span>
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
      key: "claimed",
      header: "Claimed by",
      sortValue: (dispute) => dispute.claimed_by?.full_name ?? "",
      cell: (dispute) =>
        dispute.claimed_by ? (
          <span className="text-sm">{dispute.claimed_by.full_name}</span>
        ) : (
          <span className="text-xs text-dim">Nobody yet</span>
        ),
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
        dispute.status === "PENDING" ? disputeDaysRemaining(dispute.raised_at) : 999,
      cell: (dispute) => {
        if (dispute.status !== "PENDING") {
          return (
            <span className="text-xs text-dim">
              {formatDate(dispute.resolved_at ?? dispute.forfeited_at)}
            </span>
          );
        }
        const days = disputeDaysRemaining(dispute.raised_at);
        return (
          <span
            className={`text-xs font-semibold ${days <= 2 ? "text-bad" : "text-warn"}`}
          >
            {days > 0 ? `${days}d` : "expired"}
          </span>
        );
      },
    },
  ];

  const activeFilters = [status, projectId, taskerId, from, to].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Disputes"
        description="Two taskers logged the same task ID on the same project. Only the two parties can settle it — a claim followed by the other's confirmation."
        actions={
          <Button variant="outline" disabled={exporting || !data.length} onClick={() => void exportPdf()}>
            <Download className="h-4 w-4" /> {exporting ? "Preparing…" : "Export PDF"}
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard
          label="Pending"
          value={counts.pending}
          tone={counts.pending ? "warn" : "default"}
          icon={AlertTriangle}
        />
        <StatCard
          label="Expiring in 2 days"
          value={counts.expiring}
          tone={counts.expiring ? "bad" : "default"}
          hint="Both parties forfeit if nobody acts"
        />
        <StatCard label="Resolved" value={counts.resolved} tone="good" icon={CheckCircle2} />
        <StatCard label="Forfeited" value={counts.forfeited} tone="bad" icon={XCircle} />
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
    </>
  );
}
