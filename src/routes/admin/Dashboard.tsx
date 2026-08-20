import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FolderKanban,
  ListChecks,
  Receipt,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  CardSkeleton,
  DataTable,
  DonutChart,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  PanelHeader,
  RankedBarChart,
  SegmentedFilter,
  SelectFilter,
  StatCard,
  StatGrid,
  STATUS_COLORS,
  TrendChart,
  UserAvatar,
  foldToSeries,
  seriesColor,
} from "@/components/common";
import { invoiceColumns } from "@/components/invoices/invoiceColumns";
import { useAsync } from "@/hooks/useAsync";
import { useAllProjects, useMembers } from "@/hooks/useLookups";
import { disputesService, invoicesService, tasksService } from "@/services";
import { dailySeries, lastDays, sumBy, toRanked } from "@/lib/aggregate";
import { formatCurrency, formatMinutes } from "@/lib/format";
import { PROJECT_STATUSES, type Dispute, type Invoice, type TaskOverview } from "@/types";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

const EMPTY_OVERVIEW: TaskOverview = {
  summary: {
    total_entries: 0,
    completed: 0,
    disputed: 0,
    forfeited: 0,
    total_paid_minutes: 0,
    taskers: 0,
    projects: 0,
  },
  entries: [],
};

export default function AdminDashboard() {
  const { projects, options: projectOptions, nameById: projectNames } = useAllProjects();
  const { members, taskers, nameById: memberNames } = useMembers();

  const [range, setRange] = useState("30");
  const [projectId, setProjectId] = useState("");

  const days = Number(range);
  const window = useMemo(() => lastDays(days), [days]);

  const tasks = useAsync<TaskOverview>(
    () =>
      tasksService.overview({
        projectId: projectId || undefined,
        dateFrom: window.from,
        dateTo: window.to,
      }),
    [projectId, window.from, window.to],
    EMPTY_OVERVIEW,
  );

  const disputes = useAsync<Dispute[]>(
    () => disputesService.list({ projectId: projectId || undefined }),
    [projectId],
    [],
  );

  const invoices = useAsync<Invoice[]>(
    () => invoicesService.list({ projectId: projectId || undefined }),
    [projectId],
    [],
  );

  const trend = useMemo(
    () =>
      dailySeries(
        tasks.data.entries,
        (entry) => entry.task_date,
        (entry) => entry.paid_minutes,
        days,
      ).map((point) => ({ label: point.label, minutes: point.value })),
    [tasks.data.entries, days],
  );

  const topTaskers = useMemo(() => {
    const totals = sumBy(
      tasks.data.entries,
      (entry) => entry.tasker_id,
      (entry) => entry.paid_minutes,
    );
    const ranked = toRanked(totals, (id) => memberNames.get(id) ?? "Unknown");
    return foldToSeries(ranked, (row) => row.value, (row) => row.label);
  }, [tasks.data.entries, memberNames]);

  const projectMix = useMemo(
    () =>
      PROJECT_STATUSES.map((status, index) => ({
        label: status.charAt(0) + status.slice(1).toLowerCase(),
        value: projects.filter((project) => project.status === status).length,
        color:
          status === "ACTIVE"
            ? STATUS_COLORS.good
            : status === "DEACTIVATED"
              ? STATUS_COLORS.bad
              : seriesColor(index),
      })).filter((slice) => slice.value > 0),
    [projects],
  );

  const openDisputes = disputes.data.filter((dispute) => dispute.status === "PENDING");
  const unpaid = invoices.data.filter((invoice) => invoice.status !== "Paid");
  const recentInvoices = useMemo(
    () => [...invoices.data].slice(0, 6),
    [invoices.data],
  );

  const idleTaskers = useMemo(() => {
    const active = new Set(tasks.data.entries.map((entry) => entry.tasker_id));
    return taskers.filter((tasker) => tasker.status === "ACTIVE" && !active.has(tasker.id));
  }, [taskers, tasks.data.entries]);

  const loading = tasks.loading || invoices.loading;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Admin dashboard"
        description={`Task activity, disputes and billing across the platform over the last ${days} days.`}
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/tasks">
              <ListChecks className="h-4 w-4" /> Task log
            </Link>
          </Button>
        }
      />

      {openDisputes.length > 0 && (
        <Panel className="border-warn/50 bg-warn/[0.07]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
              <div>
                <p className="text-sm font-semibold text-frost">
                  {openDisputes.length} unresolved dispute{openDisputes.length === 1 ? "" : "s"}
                </p>
                <p className="mt-0.5 text-sm text-mist">
                  Only the two parties can settle a dispute. Each one holds two task entries out of
                  invoicing until it's resolved, and forfeits after five days.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/admin/disputes">
                Review <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </Panel>
      )}

      <FilterBar>
        <SegmentedFilter ariaLabel="Time range" value={range} onChange={setRange} options={RANGES} />
        <SelectFilter
          label="Project"
          value={projectId}
          onChange={setProjectId}
          options={projectOptions}
          allLabel="All projects"
        />
      </FilterBar>

      {loading ? (
        <StatGrid>
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Billable logged"
            value={formatMinutes(tasks.data.summary.total_paid_minutes)}
            hint={`${tasks.data.summary.total_entries} entries from ${tasks.data.summary.taskers} taskers`}
            icon={Clock}
            to="/admin/tasks"
          />
          <StatCard
            label="Outstanding"
            value={formatCurrency(unpaid.reduce((sum, invoice) => sum + invoice.total, 0))}
            hint={`${unpaid.length} invoice${unpaid.length === 1 ? "" : "s"} unpaid`}
            tone={unpaid.length ? "warn" : "default"}
            icon={Receipt}
            to="/admin/invoices"
          />
          <StatCard
            label="Open disputes"
            value={openDisputes.length}
            hint={`${tasks.data.summary.disputed} entries held back`}
            tone={openDisputes.length ? "warn" : "default"}
            icon={AlertTriangle}
            to="/admin/disputes"
          />
          <StatCard
            label="Active projects"
            value={projects.filter((project) => project.status === "ACTIVE").length}
            hint={`${members.length} members, ${taskers.length} taskers`}
            icon={FolderKanban}
            to="/admin/projects"
          />
        </StatGrid>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <TrendChart
          title="Billable minutes per day"
          description="Every tasker's completed work, across the selected project filter."
          data={trend}
          xKey="label"
          series={[{ key: "minutes", label: "Billable minutes" }]}
          format={(value) => `${value}m`}
          className="lg:col-span-2"
          emptyLabel="Nothing logged in this range."
        />
        <DonutChart
          title="Projects by status"
          description="The whole portfolio, regardless of date filter."
          data={projectMix}
          total={projects.length.toString()}
          totalLabel="projects"
          emptyLabel="Create a project to get started."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankedBarChart
          title="Most active taskers"
          description="Billable minutes logged in this period."
          data={topTaskers}
          format={(value) => `${value}m`}
          emptyLabel="No task entries in this range."
        />

        <Panel className="space-y-4">
          <PanelHeader
            title="Taskers with no activity"
            description={`${idleTaskers.length} active tasker${
              idleTaskers.length === 1 ? " has" : "s have"
            } logged nothing in this period.`}
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/members">
                  Members <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            }
          />
          {idleTaskers.length ? (
            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {idleTaskers.slice(0, 12).map((tasker) => (
                <li
                  key={tasker.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-ink2/50 p-2.5"
                >
                  <UserAvatar name={tasker.full_name} src={tasker.avatar} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-frost">{tasker.full_name}</p>
                    <p className="truncate text-xs text-mist">{tasker.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="Everyone's logging work"
              description="Every active tasker has entries in this period."
            />
          )}
        </Panel>
      </div>

      <Panel className="space-y-4">
        <PanelHeader
          title="Recent invoices"
          description="The six most recently generated."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/invoices">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
        <AsyncSection
          loading={invoices.loading}
          error={invoices.error}
          onRetry={invoices.refetch}
          isEmpty={!recentInvoices.length}
          empty={
            <EmptyState
              icon={Receipt}
              title="No invoices generated yet"
              description="Generate one once taskers have logged completed work."
              action={
                <Button asChild size="sm">
                  <Link to="/admin/invoices">Go to invoicing</Link>
                </Button>
              }
            />
          }
        >
          <DataTable
            rows={recentInvoices}
            columns={invoiceColumns({
              projectName: (id) => (id ? (projectNames.get(id) ?? "—") : "—"),
              taskerName: (id) => (id ? (memberNames.get(id) ?? "—") : "—"),
            })}
            getRowKey={(invoice) => invoice.id}
          />
        </AsyncSection>
      </Panel>
    </>
  );
}
