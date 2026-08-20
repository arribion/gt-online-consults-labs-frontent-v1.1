import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FolderKanban,
  ListChecks,
  Receipt,
  Upload,
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
  foldToSeries,
} from "@/components/common";
import { taskColumns } from "@/components/tasks/taskColumns";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/hooks/useAuth";
import { useMyProjects } from "@/hooks/useLookups";
import { disputesService, invoicesService, tasksService } from "@/services";
import { dailySeries, sumBy, toRanked } from "@/lib/aggregate";
import { formatCurrency, formatMinutes, minutesToHours } from "@/lib/format";
import type { Dispute, Invoice, TaskEntry } from "@/types";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { assignments, options: projectOptions, nameById, loading: projectsLoading } =
    useMyProjects();

  const [range, setRange] = useState("30");
  const [projectId, setProjectId] = useState("");

  const tasks = useAsync<TaskEntry[]>(
    () => tasksService.mine(projectId || undefined),
    [projectId],
    [],
  );
  const disputes = useAsync<Dispute[]>(() => disputesService.mine(), [], []);
  const invoices = useAsync<Invoice[]>(() => invoicesService.list(), [], []);

  const days = Number(range);

  /** Everything below reads from this window, so the tiles and charts agree. */
  const windowed = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    return tasks.data.filter((task) => new Date(task.task_date) >= cutoff);
  }, [tasks.data, days]);

  const billable = useMemo(
    () =>
      windowed.filter(
        (task) =>
          task.task_status.toLowerCase() === "completed" &&
          task.dispute_state !== "DISPUTED" &&
          task.dispute_state !== "FORFEITED",
      ),
    [windowed],
  );

  const openDisputes = disputes.data.filter((dispute) => dispute.status === "PENDING");
  const unpaidInvoices = invoices.data.filter((invoice) => invoice.status !== "Paid");

  const trend = useMemo(
    () =>
      dailySeries(billable, (task) => task.task_date, (task) => task.paid_minutes, days).map(
        (point) => ({ label: point.label, minutes: point.value }),
      ),
    [billable, days],
  );

  const byProject = useMemo(() => {
    const totals = sumBy(billable, (task) => task.project_id, (task) => task.paid_minutes);
    const ranked = toRanked(totals, (id) => nameById.get(id) ?? "Unknown project");
    return foldToSeries(ranked, (row) => row.value, (row) => row.label);
  }, [billable, nameById]);

  const byOutcome = useMemo(() => {
    const completed = windowed.filter(
      (task) => task.task_status.toLowerCase() === "completed" && task.dispute_state === "NONE",
    ).length;
    const resolved = windowed.filter((task) => task.dispute_state === "RESOLVED").length;
    const disputed = windowed.filter((task) => task.dispute_state === "DISPUTED").length;
    const forfeited = windowed.filter((task) => task.dispute_state === "FORFEITED").length;
    const other = windowed.length - completed - resolved - disputed - forfeited;

    return [
      { label: "Billable", value: completed + resolved, color: STATUS_COLORS.good },
      { label: "Disputed", value: disputed, color: STATUS_COLORS.warn },
      { label: "Forfeited", value: forfeited, color: STATUS_COLORS.bad },
      { label: "Not completed", value: Math.max(0, other), color: STATUS_COLORS.neutral },
    ].filter((slice) => slice.value > 0);
  }, [windowed]);

  const recent = useMemo(
    () =>
      [...tasks.data]
        .sort((a, b) => b.task_date.localeCompare(a.task_date))
        .slice(0, 6),
    [tasks.data],
  );

  const totalBillableMinutes = billable.reduce((sum, task) => sum + task.paid_minutes, 0);
  const firstName = user?.full_name.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        description={`Your logged work over the last ${days} days, and anything waiting on you.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/client/tasks">
                <ListChecks className="h-4 w-4" /> My tasks
              </Link>
            </Button>
            <Button asChild>
              <Link to="/client/log">
                <Upload className="h-4 w-4" /> Log tasks
              </Link>
            </Button>
          </>
        }
      />

      {openDisputes.length > 0 && (
        <Panel className="border-warn/50 bg-warn/[0.07]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
              <div>
                <p className="text-sm font-semibold text-frost">
                  {openDisputes.length} open dispute{openDisputes.length === 1 ? "" : "s"} need
                  attention
                </p>
                <p className="mt-0.5 text-sm text-mist">
                  Nothing emails you about these. An unresolved dispute forfeits for both parties
                  five days after it was raised.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/client/disputes">
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

      {tasks.loading || projectsLoading ? (
        <StatGrid>
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Billable time"
            value={formatMinutes(totalBillableMinutes)}
            hint={`${minutesToHours(totalBillableMinutes)} h across ${billable.length} tasks`}
            icon={Clock}
            to="/client/tasks"
          />
          <StatCard
            label="Tasks logged"
            value={windowed.length}
            hint={`${tasks.data.length} all time`}
            icon={ListChecks}
            to="/client/tasks"
          />
          <StatCard
            label="Active projects"
            value={assignments.length}
            hint="Projects you can log against"
            icon={FolderKanban}
            to="/client/projects"
          />
          <StatCard
            label="Unpaid invoices"
            value={formatCurrency(unpaidInvoices.reduce((sum, invoice) => sum + invoice.total, 0))}
            hint={`${unpaidInvoices.length} awaiting payment`}
            tone={unpaidInvoices.length ? "warn" : "default"}
            icon={Receipt}
            to="/client/invoices"
          />
        </StatGrid>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <TrendChart
          title="Billable minutes per day"
          description={`Completed, undisputed work over the last ${days} days.`}
          data={trend}
          xKey="label"
          series={[{ key: "minutes", label: "Billable minutes" }]}
          format={(value) => `${value}m`}
          className="lg:col-span-2"
          emptyLabel="Log a task and the trend starts here."
        />
        <DonutChart
          title="Task outcomes"
          description="Where this period's entries ended up."
          data={byOutcome}
          total={windowed.length.toString()}
          totalLabel="tasks logged"
          emptyLabel="Nothing logged in this range yet."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankedBarChart
          title="Billable minutes by project"
          description="Where your billable time went this period."
          data={byProject}
          format={(value) => `${value}m`}
        />

        <Panel className="space-y-4">
          <PanelHeader
            title="Recent entries"
            description="Your six most recent task logs."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/client/tasks">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            }
          />
          <AsyncSection
            loading={tasks.loading}
            error={tasks.error}
            onRetry={tasks.refetch}
            isEmpty={!recent.length}
            empty={
              <EmptyState
                icon={ListChecks}
                title="No tasks logged yet"
                description="Upload a task log to get started."
                action={
                  <Button asChild size="sm">
                    <Link to="/client/log">Log tasks</Link>
                  </Button>
                }
              />
            }
          >
            <DataTable
              rows={recent}
              columns={taskColumns<TaskEntry>((id) => (id ? (nameById.get(id) ?? "—") : "—"))}
              getRowKey={(task) => task.id}
            />
          </AsyncSection>
        </Panel>
      </div>
    </>
  );
}
