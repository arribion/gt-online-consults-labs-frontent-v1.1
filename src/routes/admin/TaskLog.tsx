import { useMemo, useState } from "react";
import { AlertTriangle, Clock, CopyX, ListChecks } from "lucide-react";
import {
  AsyncSection,
  DataTable,
  DateFilter,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  PanelHeader,
  RankedBarChart,
  SearchInput,
  SegmentedFilter,
  SelectFilter,
  StatCard,
  StatGrid,
  TrendChart,
  foldToSeries,
  type Column,
} from "@/components/common";
import { taskColumns } from "@/components/tasks/taskColumns";
import { useAsync } from "@/hooks/useAsync";
import { useAllProjects, useMembers } from "@/hooks/useLookups";
import { tasksService } from "@/services";
import { dailySeries, sumBy, toRanked } from "@/lib/aggregate";
import { formatDateTime, formatMinutes } from "@/lib/format";
import {
  DISPUTE_STATES,
  type DuplicateLog,
  type DuplicateLogReport,
  type TaskEntryWithParties,
  type TaskOverview,
} from "@/types";

const DISPUTE_OPTIONS = DISPUTE_STATES.map((value) => ({
  value,
  label: value === "NONE" ? "No dispute" : value.charAt(0) + value.slice(1).toLowerCase(),
}));

const TABS = [
  { value: "entries", label: "Entries" },
  { value: "duplicates", label: "Duplicate attempts" },
];

/**
 * The admin window into logged work.
 *
 * Before an invoice exists there is nothing else that shows what taskers have
 * actually submitted — the dispute and duplicate logs only ever surface the
 * exceptions — so this is the page that answers "is anyone logging anything".
 */
export default function AdminTaskLog() {
  const { options: projectOptions, nameById: projectNames } = useAllProjects();
  const { taskerOptions, nameById: memberNames } = useMembers();

  const [tab, setTab] = useState("entries");
  const [projectId, setProjectId] = useState("");
  const [taskerId, setTaskerId] = useState("");
  const [disputeState, setDisputeState] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  const overview = useAsync<TaskOverview>(
    () =>
      tasksService.overview({
        projectId: projectId || undefined,
        taskerId: taskerId || undefined,
        disputeState: (disputeState || undefined) as TaskEntryWithParties["dispute_state"],
        dateFrom: from || undefined,
        dateTo: to || undefined,
      }),
    [projectId, taskerId, disputeState, from, to],
    { summary: EMPTY_SUMMARY, entries: [] },
  );

  const duplicates = useAsync<DuplicateLogReport>(
    () =>
      tasksService.duplicates({
        projectId: projectId || undefined,
        taskerId: taskerId || undefined,
      }),
    [projectId, taskerId],
    { count: 0, counts_by_tasker: {}, duplicates: [] },
    { enabled: tab === "duplicates" },
  );

  const entries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return overview.data.entries;
    return overview.data.entries.filter((entry) =>
      `${entry.task_id} ${entry.account} ${entry.tasker_name ?? ""}`.toLowerCase().includes(needle),
    );
  }, [overview.data.entries, search]);

  const trend = useMemo(
    () =>
      dailySeries(
        overview.data.entries,
        (entry) => entry.task_date,
        (entry) => entry.paid_minutes,
        30,
      ).map((point) => ({ label: point.label, minutes: point.value })),
    [overview.data.entries],
  );

  const byTasker = useMemo(() => {
    const totals = sumBy(
      overview.data.entries,
      (entry) => entry.tasker_id,
      (entry) => entry.paid_minutes,
    );
    const ranked = toRanked(totals, (id) => memberNames.get(id) ?? "Unknown");
    return foldToSeries(ranked, (row) => row.value, (row) => row.label);
  }, [overview.data.entries, memberNames]);

  const byProject = useMemo(() => {
    const totals = sumBy(
      overview.data.entries,
      (entry) => entry.project_id,
      (entry) => entry.paid_minutes,
    );
    const ranked = toRanked(totals, (id) => projectNames.get(id) ?? "Unknown");
    return foldToSeries(ranked, (row) => row.value, (row) => row.label);
  }, [overview.data.entries, projectNames]);

  const duplicateColumns: Column<DuplicateLog>[] = [
    {
      key: "task_id",
      header: "Task ID",
      mobile: "primary",
      sortValue: (row) => row.task_id,
      cell: (row) => <span className="font-mono text-xs">{row.task_id}</span>,
    },
    {
      key: "tasker",
      header: "Tasker",
      mobile: "secondary",
      sortValue: (row) => memberNames.get(row.tasker_id ?? "") ?? "",
      cell: (row) => memberNames.get(row.tasker_id ?? "") ?? "Unknown",
    },
    {
      key: "project",
      header: "Project",
      sortValue: (row) => projectNames.get(row.project_id ?? "") ?? "",
      cell: (row) => projectNames.get(row.project_id ?? "") ?? "—",
    },
    {
      key: "attempts",
      header: "Their total attempts",
      align: "right",
      sortValue: (row) => duplicates.data.counts_by_tasker[row.tasker_id ?? ""] ?? 0,
      cell: (row) => {
        const count = duplicates.data.counts_by_tasker[row.tasker_id ?? ""] ?? 0;
        return (
          <span className={count > 3 ? "font-semibold text-warn" : "text-mist"}>{count}</span>
        );
      },
    },
    {
      key: "attempted_at",
      header: "When",
      sortValue: (row) => row.attempted_at,
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-mist">
          {formatDateTime(row.attempted_at)}
        </span>
      ),
    },
  ];

  const activeFilters = [projectId, taskerId, disputeState, from, to, search].filter(Boolean).length;

  const resetFilters = () => {
    setProjectId("");
    setTaskerId("");
    setDisputeState("");
    setFrom("");
    setTo("");
    setSearch("");
  };

  const { summary } = overview.data;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Task log"
        description="Every task entry across the platform, plus the log of duplicate upload attempts."
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard label="Entries" value={summary.total_entries} icon={ListChecks} />
        <StatCard
          label="Billable time"
          value={formatMinutes(summary.total_paid_minutes)}
          hint={`${summary.completed} completed`}
          icon={Clock}
        />
        <StatCard
          label="Disputed"
          value={summary.disputed}
          tone={summary.disputed ? "warn" : "default"}
          hint="Held back from invoicing"
          icon={AlertTriangle}
          to="/admin/disputes"
        />
        <StatCard
          label="Forfeited"
          value={summary.forfeited}
          tone={summary.forfeited ? "bad" : "default"}
          hint="Never billable"
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrendChart
          title="Billable minutes per day"
          description="All taskers, last 30 days of the current filter."
          data={trend}
          xKey="label"
          series={[{ key: "minutes", label: "Billable minutes" }]}
          format={(value) => `${value}m`}
          className="lg:col-span-2"
          emptyLabel="No entries in this range."
        />
        <RankedBarChart
          title="Top taskers"
          description="Billable minutes logged."
          data={byTasker}
          format={(value) => `${value}m`}
        />
      </div>

      <SegmentedFilter ariaLabel="Task log view" value={tab} onChange={setTab} options={TABS} />

      <Panel className="space-y-4">
        <FilterBar active={activeFilters} onReset={resetFilters}>
          {tab === "entries" && (
            <SearchInput value={search} onChange={setSearch} placeholder="Task ID, account, name…" />
          )}
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
            allLabel="All taskers"
          />
          {tab === "entries" && (
            <>
              <SelectFilter
                label="Dispute"
                value={disputeState}
                onChange={setDisputeState}
                options={DISPUTE_OPTIONS}
                allLabel="Any"
              />
              <DateFilter label="From" value={from} onChange={setFrom} max={to || undefined} />
              <DateFilter label="To" value={to} onChange={setTo} min={from || undefined} />
            </>
          )}
        </FilterBar>

        {tab === "entries" ? (
          <AsyncSection
            loading={overview.loading}
            error={overview.error}
            onRetry={overview.refetch}
            isEmpty={!entries.length}
            empty={
              <EmptyState
                icon={ListChecks}
                title="No task entries match"
                description="Widen the date range, or check whether anyone has uploaded yet."
              />
            }
          >
            <DataTable
              rows={entries}
              columns={[
                ...taskColumns<TaskEntryWithParties>((id) =>
                  id ? (projectNames.get(id) ?? "—") : "—",
                ),
                {
                  key: "tasker",
                  header: "Tasker",
                  sortValue: (entry) => entry.tasker_name ?? "",
                  cell: (entry) => entry.tasker_name ?? <span className="text-dim">—</span>,
                },
              ]}
              getRowKey={(entry) => entry.id}
              pageSize={25}
            />
          </AsyncSection>
        ) : (
          <>
            <PanelHeader
              title="Duplicate upload attempts"
              description="A tasker re-submitting a task ID they'd already logged on the same project. The row is skipped, not rejected — this log exists to spot a pattern."
            />
            <AsyncSection
              loading={duplicates.loading}
              error={duplicates.error}
              onRetry={duplicates.refetch}
              isEmpty={!duplicates.data.duplicates.length}
              empty={
                <EmptyState
                  icon={CopyX}
                  title="No duplicate attempts logged"
                  description="Nobody has re-uploaded a task they'd already submitted."
                />
              }
            >
              <DataTable
                rows={duplicates.data.duplicates}
                columns={duplicateColumns}
                getRowKey={(row) => row.id}
                pageSize={25}
              />
            </AsyncSection>
          </>
        )}
      </Panel>

      <RankedBarChart
        title="Billable minutes by project"
        description="Where logged time is going, under the current filters."
        data={byProject}
        format={(value) => `${value}m`}
      />
    </>
  );
}

const EMPTY_SUMMARY = {
  total_entries: 0,
  completed: 0,
  disputed: 0,
  forfeited: 0,
  total_paid_minutes: 0,
  taskers: 0,
  projects: 0,
};
