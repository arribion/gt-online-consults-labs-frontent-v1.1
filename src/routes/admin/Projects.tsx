import { useMemo, useState } from "react";
import { FolderKanban, Pencil, Plus, PowerOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SearchInput,
  SelectFilter,
  StatCard,
  StatGrid,
  StatusBadge,
  type Column,
} from "@/components/common";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ProjectTeamDialog } from "@/components/projects/ProjectTeamDialog";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useAllProjects } from "@/hooks/useLookups";
import { assignmentsService, projectsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { PROJECT_STATUSES, type Assignment, type Project } from "@/types";

const STATUS_OPTIONS = PROJECT_STATUSES.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

export default function AdminProjects() {
  const { projects, loading, error, refetch } = useAllProjects();
  const assignments = useAsync<Assignment[]>(() => assignmentsService.list(), [], []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [team, setTeam] = useState<Project | null>(null);
  const [deactivating, setDeactivating] = useState<Project | null>(null);

  const { mutate: deactivate, pending: deactivatingPending } = useMutation(
    (project: Project) => projectsService.deactivate(project.id),
    { success: "Project deactivated.", onDone: () => void refetch() },
  );

  /** Active assignment count per project, for the roster column. */
  const taskerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const assignment of assignments.data) {
      counts.set(assignment.project_id, (counts.get(assignment.project_id) ?? 0) + 1);
    }
    return counts;
  }, [assignments.data]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (status && project.status !== status) return false;
      if (
        needle &&
        !`${project.project_name} ${project.platform} ${project.category ?? ""}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [projects, search, status]);

  const columns: Column<Project>[] = [
    {
      key: "project_name",
      header: "Project",
      mobile: "primary",
      sortValue: (project) => project.project_name,
      cell: (project) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-frost">{project.project_name}</p>
          <p className="truncate text-xs text-dim">{project.platform}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "secondary",
      sortValue: (project) => project.status,
      cell: (project) => <StatusBadge status={project.status} size="sm" />,
    },
    {
      key: "category",
      header: "Category",
      sortValue: (project) => project.category ?? "",
      cell: (project) => project.category || <span className="text-dim">—</span>,
    },
    {
      key: "avg_pay",
      header: "Rate",
      align: "right",
      sortValue: (project) => project.avg_pay,
      cell: (project) => (
        <span className="tabular-nums">{formatCurrency(project.avg_pay)}/hr</span>
      ),
    },
    {
      key: "taskers",
      header: "Taskers",
      align: "right",
      sortValue: (project) => taskerCounts.get(project.id) ?? 0,
      cell: (project) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setTeam(project);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-sky2 transition-colors hover:bg-azure/10"
        >
          <Users className="h-3.5 w-3.5" /> {taskerCounts.get(project.id) ?? 0}
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortValue: (project) => project.created_at,
      cell: (project) => (
        <span className="whitespace-nowrap text-xs text-mist">
          {formatDate(project.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (project) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${project.project_name}`}
            onClick={(event) => {
              event.stopPropagation();
              setEditing(project);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {project.status !== "DEACTIVATED" && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Deactivate ${project.project_name}`}
              className="text-bad hover:bg-bad/10"
              onClick={(event) => {
                event.stopPropagation();
                setDeactivating(project);
              }}
            >
              <PowerOff className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const active = projects.filter((project) => project.status === "ACTIVE").length;
  const activeFilters = [search, status].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Projects"
        description="Create projects, set their default rate, and manage who's assigned to each."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} />
        <StatCard label="Active" value={active} tone="good" />
        <StatCard
          label="Deactivated"
          value={projects.filter((project) => project.status === "DEACTIVATED").length}
          tone="bad"
        />
        <StatCard
          label="Assignments"
          value={assignments.data.length}
          hint="Active tasker–project links"
          icon={Users}
        />
      </StatGrid>

      <Panel className="space-y-4">
        <FilterBar
          active={activeFilters}
          onReset={() => {
            setSearch("");
            setStatus("");
          }}
        >
          <SearchInput value={search} onChange={setSearch} placeholder="Name, platform, category…" />
          <SelectFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            allLabel="Any status"
          />
        </FilterBar>

        <AsyncSection
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={!rows.length}
          empty={
            <EmptyState
              icon={FolderKanban}
              title={projects.length ? "Nothing matches these filters" : "No projects yet"}
              description={
                projects.length
                  ? "Try a different status or search term."
                  : "Create a project so taskers have something to log against."
              }
              action={
                !projects.length ? (
                  <Button size="sm" onClick={() => setCreating(true)}>
                    Create the first project
                  </Button>
                ) : undefined
              }
            />
          }
        >
          <DataTable
            rows={rows}
            columns={columns}
            getRowKey={(project) => project.id}
            pageSize={15}
          />
        </AsyncSection>
      </Panel>

      <ProjectFormDialog open={creating} onOpenChange={setCreating} onSaved={refetch} />
      <ProjectFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        project={editing}
        onSaved={refetch}
      />
      <ProjectTeamDialog
        project={team}
        onClose={() => {
          setTeam(null);
          void assignments.refetch();
        }}
      />

      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Deactivate this project?"
        confirmLabel="Deactivate project"
        pending={deactivatingPending}
        message={
          <>
            <span className="font-semibold text-frost">{deactivating?.project_name}</span> stays on
            the list with a Deactivated status, and its assignments, task entries and invoices are
            all kept. Its uploaded resource files are{" "}
            <span className="font-semibold text-frost">permanently deleted</span>, and that part
            can't be undone.
          </>
        }
        onConfirm={async () => {
          if (!deactivating) return;
          await deactivate(deactivating);
          setDeactivating(null);
        }}
      />
    </>
  );
}
