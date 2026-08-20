import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ListChecks, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  DataTable,
  DateFilter,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SearchInput,
  SelectFilter,
  StatCard,
  StatGrid,
} from "@/components/common";
import { taskColumns } from "@/components/tasks/taskColumns";
import { useAsync } from "@/hooks/useAsync";
import { useMyProjects } from "@/hooks/useLookups";
import { tasksService } from "@/services";
import { formatMinutes } from "@/lib/format";
import { DISPUTE_STATES, type TaskEntry } from "@/types";

const DISPUTE_OPTIONS = DISPUTE_STATES.map((state) => ({
  value: state,
  label: state === "NONE" ? "No dispute" : state.charAt(0) + state.slice(1).toLowerCase(),
}));

export default function MyTasks() {
  const { options: projectOptions, nameById } = useMyProjects();

  const [projectId, setProjectId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dispute, setDispute] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // The project filter is a server-side query; the rest narrow what came back,
  // because /tasks/mine only filters by project.
  const { data, loading, error, refetch } = useAsync<TaskEntry[]>(
    () => tasksService.mine(projectId || undefined),
    [projectId],
    [],
  );

  const statusOptions = useMemo(
    () =>
      [...new Set(data.map((task) => task.task_status))]
        .sort()
        .map((value) => ({ value, label: value })),
    [data],
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.filter((task) => {
      if (needle && !`${task.task_id} ${task.account}`.toLowerCase().includes(needle)) return false;
      if (status && task.task_status !== status) return false;
      if (dispute && task.dispute_state !== dispute) return false;
      if (from && task.task_date.slice(0, 10) < from) return false;
      if (to && task.task_date.slice(0, 10) > to) return false;
      return true;
    });
  }, [data, search, status, dispute, from, to]);

  const totals = useMemo(
    () => ({
      billable: rows
        .filter((task) => task.task_status.toLowerCase() === "completed")
        .filter((task) => task.dispute_state !== "DISPUTED" && task.dispute_state !== "FORFEITED")
        .reduce((sum, task) => sum + task.paid_minutes, 0),
      disputed: rows.filter((task) => task.dispute_state === "DISPUTED").length,
      forfeited: rows.filter((task) => task.dispute_state === "FORFEITED").length,
    }),
    [rows],
  );

  const activeFilters = [projectId, search, status, dispute, from, to].filter(Boolean).length;

  const resetFilters = () => {
    setProjectId("");
    setSearch("");
    setStatus("");
    setDispute("");
    setFrom("");
    setTo("");
  };

  return (
    <>
      <PageHeader
        eyebrow="Task log"
        title="My tasks"
        description="Everything you've logged, with the billable minutes the system computed for each row."
        actions={
          <Button asChild>
            <Link to="/client/log">
              <Upload className="h-4 w-4" /> Log tasks
            </Link>
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard label="Tasks shown" value={rows.length} icon={ListChecks} />
        <StatCard
          label="Billable time"
          value={formatMinutes(totals.billable)}
          hint="Completed, undisputed rows"
        />
        <StatCard
          label="Disputed"
          value={totals.disputed}
          tone={totals.disputed ? "warn" : "default"}
          icon={AlertTriangle}
          hint={totals.disputed ? "Held back from invoicing" : "Nothing contested"}
          to={totals.disputed ? "/client/disputes" : undefined}
        />
        <StatCard
          label="Forfeited"
          value={totals.forfeited}
          tone={totals.forfeited ? "bad" : "default"}
          hint="Never billable"
        />
      </StatGrid>

      <Panel className="space-y-4">
        <FilterBar onReset={resetFilters} active={activeFilters}>
          <SearchInput value={search} onChange={setSearch} placeholder="Task ID or account…" />
          <SelectFilter
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
            allLabel="All projects"
          />
          <SelectFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
            allLabel="Any status"
          />
          <SelectFilter
            label="Dispute"
            value={dispute}
            onChange={setDispute}
            options={DISPUTE_OPTIONS}
            allLabel="Any"
          />
          <DateFilter label="From" value={from} onChange={setFrom} max={to || undefined} />
          <DateFilter label="To" value={to} onChange={setTo} min={from || undefined} />
        </FilterBar>

        <AsyncSection
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={!rows.length}
          empty={
            <EmptyState
              icon={ListChecks}
              title={data.length ? "No tasks match these filters" : "No tasks logged yet"}
              description={
                data.length
                  ? "Try widening the date range or clearing a filter."
                  : "Upload a task log and your entries will appear here."
              }
              action={
                !data.length ? (
                  <Button asChild size="sm">
                    <Link to="/client/log">Log your first tasks</Link>
                  </Button>
                ) : undefined
              }
            />
          }
        >
          <DataTable
            rows={rows}
            columns={taskColumns<TaskEntry>((id) => (id ? (nameById.get(id) ?? "—") : "—"))}
            getRowKey={(task) => task.id}
            pageSize={25}
          />
        </AsyncSection>
      </Panel>
    </>
  );
}
