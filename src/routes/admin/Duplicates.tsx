import { useMemo, useState } from "react";
import { Copy, Repeat2, UserRoundX, Users } from "lucide-react";
import {
  AsyncSection,
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  RankedBarChart,
  SelectFilter,
  StatCard,
  StatGrid,
  foldToSeries,
  type Column,
} from "@/components/common";
import { useAsync } from "@/hooks/useAsync";
import { useAllProjects, useMembers } from "@/hooks/useLookups";
import { tasksService } from "@/services";
import { formatDateTime } from "@/lib/format";
import { toRanked } from "@/lib/aggregate";
import type { DuplicateLog, DuplicateLogReport } from "@/types";

/**
 * Rejected duplicate uploads.
 *
 * A duplicate is a tasker re-submitting a task ID they have already logged.
 * It is refused outright rather than skipped — and refusing is exactly why
 * this page can exist: a silently dropped row hid the one thing worth seeing,
 * which is a *pattern* of re-submission by the same person.
 *
 * One or two rows here are ordinary — a re-uploaded spreadsheet, a duplicated
 * line. The same task ID attempted repeatedly, or one person well ahead of
 * everyone else, is the signal.
 */
export default function AdminDuplicates() {
  const { options: projectOptions, nameById: projectNames } = useAllProjects();
  const { taskerOptions, nameById: memberNames } = useMembers();

  const [projectId, setProjectId] = useState("");
  const [taskerId, setTaskerId] = useState("");

  const { data, loading, error, refetch } = useAsync<DuplicateLogReport | null>(
    () =>
      tasksService.duplicates({
        projectId: projectId || undefined,
        taskerId: taskerId || undefined,
      }),
    [projectId, taskerId],
    null,
  );

  const rows = useMemo(() => data?.duplicates ?? [], [data]);

  const stats = useMemo(() => {
    const byTasker = data?.counts_by_tasker ?? {};
    const perTask = new Map<string, number>();
    for (const row of rows) {
      perTask.set(row.task_id, (perTask.get(row.task_id) ?? 0) + 1);
    }
    const repeated = [...perTask.values()].filter((count) => count > 1).length;
    const worst = Object.entries(byTasker).sort((a, b) => b[1] - a[1])[0];

    return {
      total: data?.count ?? 0,
      people: Object.keys(byTasker).length,
      repeated,
      worstName: worst ? (memberNames.get(worst[0]) ?? "Unknown") : "—",
      worstCount: worst?.[1] ?? 0,
      ranked: foldToSeries(
        toRanked(
          new Map(Object.entries(byTasker)),
          (id) => memberNames.get(id) ?? "Unknown",
        ),
        (row) => row.value,
        (row) => row.label,
      ),
    };
  }, [data, rows, memberNames]);

  const columns: Column<DuplicateLog>[] = [
    {
      key: "tasker",
      header: "Tasker",
      mobile: "primary",
      sortValue: (row) => memberNames.get(row.tasker_id ?? "") ?? "",
      cell: (row) => (
        <span className="font-semibold text-frost">
          {memberNames.get(row.tasker_id ?? "") ?? "Unknown"}
        </span>
      ),
    },
    {
      key: "task_id",
      header: "Task ID",
      sortValue: (row) => row.task_id,
      cell: (row) => <span className="font-mono text-xs">{row.task_id}</span>,
    },
    {
      key: "project",
      header: "Project",
      sortValue: (row) => projectNames.get(row.project_id ?? "") ?? "",
      cell: (row) => projectNames.get(row.project_id ?? "") ?? "—",
    },
    {
      key: "source",
      header: "Source",
      cell: (row) => (
        <span className="text-xs text-mist">{row.submission_id ? "Bulk upload" : "Single entry"}</span>
      ),
    },
    {
      key: "attempted_at",
      header: "Attempted",
      align: "right",
      mobile: "secondary",
      sortValue: (row) => row.attempted_at,
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-mist">
          {formatDateTime(row.attempted_at)}
        </span>
      ),
    },
  ];

  const activeFilters = [projectId, taskerId].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Duplicate attempts"
        description="Every upload rejected for repeating a task the same person had already logged. The row was refused, not recorded — this is the record of the attempt."
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard label="Attempts" value={stats.total} icon={Copy} />
        <StatCard label="People involved" value={stats.people} icon={Users} />
        <StatCard
          label="Repeated task IDs"
          value={stats.repeated}
          tone={stats.repeated ? "warn" : "default"}
          hint="Tried more than once"
          icon={Repeat2}
        />
        <StatCard
          label="Most attempts"
          value={stats.worstCount}
          hint={stats.worstName}
          tone={stats.worstCount > 5 ? "warn" : "default"}
          icon={UserRoundX}
        />
      </StatGrid>

      {stats.ranked.length > 0 && (
        <RankedBarChart
          title="Attempts by tasker"
          description="One or two is ordinary. Someone well ahead of the rest is worth a conversation."
          data={stats.ranked}
        />
      )}

      <Panel className="space-y-4">
        <FilterBar
          active={activeFilters}
          onReset={() => {
            setProjectId("");
            setTaskerId("");
          }}
        >
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
        </FilterBar>

        <AsyncSection
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={!rows.length}
          empty={
            <EmptyState
              icon={Copy}
              title={activeFilters ? "Nothing matches these filters" : "No duplicate attempts"}
              description="Nobody has tried to log a task they had already logged."
            />
          }
        >
          <DataTable rows={rows} columns={columns} getRowKey={(row) => row.id} pageSize={25} />
        </AsyncSection>
      </Panel>
    </>
  );
}
