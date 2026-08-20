import { StatusBadge, type Column } from "@/components/common";
import { formatDate, formatMinutes, truncate } from "@/lib/format";
import type { TaskEntry } from "@/types";

/**
 * The task-log columns both roles read. Defined once so a tasker and an admin
 * are never looking at the same entry described two different ways.
 *
 * `paid` is the number that actually gets billed — always min(duration, cap),
 * computed server-side — so it is shown next to the raw duration and the cap
 * rather than on its own.
 */
export function taskColumns<T extends TaskEntry>(
  projectName?: (projectId: string | null) => string,
): Column<T>[] {
  const columns: Column<T>[] = [
    {
      key: "task_id",
      header: "Task ID",
      mobile: "primary",
      sortValue: (row) => row.task_id,
      cell: (row) => (
        <span className="font-mono text-xs text-frost" title={row.task_id}>
          {truncate(row.task_id, 16)}
        </span>
      ),
    },
    {
      key: "account",
      header: "Account",
      sortValue: (row) => row.account,
      cell: (row) => (
        <span className="rounded border border-line2/60 bg-ink2 px-1.5 py-0.5 text-[11px] font-semibold text-sky2">
          {row.account}
        </span>
      ),
    },
    {
      key: "task_date",
      header: "Date",
      sortValue: (row) => row.task_date,
      cell: (row) => <span className="whitespace-nowrap">{formatDate(row.task_date)}</span>,
    },
    {
      key: "task_status",
      header: "Status",
      mobile: "secondary",
      sortValue: (row) => row.task_status,
      cell: (row) => <StatusBadge status={row.task_status} size="sm" />,
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      sortValue: (row) => row.paid_minutes,
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-mist">
          {row.duration_display} <span className="text-dim">· cap {row.cap_minutes}m</span>
        </span>
      ),
    },
    {
      key: "paid_minutes",
      header: "Billable",
      align: "right",
      sortValue: (row) => row.paid_minutes,
      cell: (row) => (
        <span className="font-semibold text-frost">{formatMinutes(row.paid_minutes)}</span>
      ),
    },
    {
      key: "dispute_state",
      header: "Dispute",
      sortValue: (row) => row.dispute_state,
      cell: (row) =>
        row.dispute_state === "NONE" ? (
          <span className="text-xs text-dim">—</span>
        ) : (
          <StatusBadge status={row.dispute_state} size="sm" />
        ),
    },
  ];

  if (projectName) {
    columns.splice(1, 0, {
      key: "project",
      header: "Project",
      sortValue: (row) => projectName(row.project_id),
      cell: (row) => <span className="text-sm">{projectName(row.project_id)}</span>,
    });
  }

  return columns;
}
