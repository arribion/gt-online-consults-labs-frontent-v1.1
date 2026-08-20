import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  EmptyState,
  Modal,
  PageHeader,
  Panel,
  StatusBadge,
  UserAvatar,
} from "@/components/common";
import { useAsync } from "@/hooks/useAsync";
import { useMyProjects } from "@/hooks/useLookups";
import { assignmentsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import type { MyProject, ProjectTeam } from "@/types";

export default function Projects() {
  const { assignments, loading, error, refetch } = useMyProjects();
  const [teamFor, setTeamFor] = useState<MyProject | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="My projects"
        description="Everything you're assigned to. You can only log tasks against projects on this list."
        actions={
          <Button asChild variant="outline">
            <Link to="/client/log">
              <Upload className="h-4 w-4" /> Log tasks
            </Link>
          </Button>
        }
      />

      <AsyncSection
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!assignments.length}
        empty={
          <Panel>
            <EmptyState
              icon={FolderKanban}
              title="No project assignments yet"
              description="An administrator assigns projects. Once you're on one, it shows up here and you can start logging tasks against it."
            />
          </Panel>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => (
            <ProjectCard
              key={assignment.assignment_id}
              assignment={assignment}
              onShowTeam={() => setTeamFor(assignment)}
            />
          ))}
        </div>
      </AsyncSection>

      <TeamDialog assignment={teamFor} onClose={() => setTeamFor(null)} />
    </>
  );
}

function ProjectCard({
  assignment,
  onShowTeam,
}: {
  assignment: MyProject;
  onShowTeam: () => void;
}) {
  const project = assignment.project;
  if (!project) return null;

  // A custom rate on the assignment overrides the project's default for this tasker.
  const rate = assignment.custom_rate ?? project.avg_pay;

  return (
    <Panel className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-base font-semibold text-frost">
            {project.project_name}
          </h2>
          <p className="mt-0.5 text-xs text-dim">{project.platform}</p>
        </div>
        <StatusBadge status={project.status} size="sm" />
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm text-mist">{project.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-dim">Your rate</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-frost">
            {formatCurrency(rate)}
            <span className="text-xs font-normal text-dim">/hr</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-dim">Assigned</dt>
          <dd className="mt-0.5 text-frost">{formatDate(assignment.assigned_at)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-2">
        <StatusBadge status={assignment.status} size="sm" />
        <Button variant="ghost" size="sm" onClick={onShowTeam}>
          <Users className="h-3.5 w-3.5" /> {assignment.taskers_count} on this project
        </Button>
      </div>
    </Panel>
  );
}

function TeamDialog({
  assignment,
  onClose,
}: {
  assignment: MyProject | null;
  onClose: () => void;
}) {
  const projectId = assignment?.project?.id ?? "";

  const { data, loading, error, refetch } = useAsync<ProjectTeam | null>(
    () => assignmentsService.team(projectId),
    [projectId],
    null,
    { enabled: !!projectId },
  );

  return (
    <Modal
      open={!!assignment}
      onOpenChange={(open) => !open && onClose()}
      title={assignment?.project?.project_name ?? "Project team"}
      description="Everyone actively assigned to this project."
      size="sm"
    >
      <AsyncSection
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!data?.taskers.length}
        empty={<EmptyState icon={Users} title="No one else is assigned yet" />}
      >
        <ul className="space-y-2">
          {(data?.taskers ?? []).map((teammate) => (
            <li
              key={teammate.assignment_id}
              className="flex items-center gap-3 rounded-xl border border-line bg-ink2/50 p-3"
            >
              <UserAvatar name={teammate.full_name} src={teammate.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-frost">
                  {teammate.full_name}
                  {teammate.is_me && <span className="ml-1.5 text-xs text-sky2">(you)</span>}
                </p>
                <p className="truncate text-xs text-mist">{teammate.email}</p>
              </div>
              <StatusBadge status={teammate.assignment_status} size="sm" />
            </li>
          ))}
        </ul>
      </AsyncSection>
    </Modal>
  );
}
