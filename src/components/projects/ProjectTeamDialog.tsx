import { useMemo, useState } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  ConfirmDialog,
  EmptyState,
  Modal,
  SearchInput,
  SelectFilter,
  StatusBadge,
  TextField,
  UserAvatar,
} from "@/components/common";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useMembers } from "@/hooks/useLookups";
import { assignmentsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  SETTABLE_ASSIGNMENT_STATUSES,
  type AssignmentStatus,
  type Project,
  type ProjectRoster,
  type ProjectRosterEntry,
} from "@/types";

const STATUS_OPTIONS = SETTABLE_ASSIGNMENT_STATUSES.map((value) => ({
  value,
  label: value.replace("_", " ").toLowerCase().replace(/^./, (char) => char.toUpperCase()),
}));

/**
 * Who is on a project, and adding or removing them.
 *
 * Removal is a soft remove — the assignment goes to REMOVED and the tasker's
 * historical task entries and invoices stay intact — so the confirm copy says
 * "remove from project", not "delete".
 */
export function ProjectTeamDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const projectId = project?.id ?? "";
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<ProjectRosterEntry | null>(null);

  const { data, loading, error, refetch } = useAsync<ProjectRoster | null>(
    () => assignmentsService.roster(projectId),
    [projectId],
    null,
    { enabled: !!projectId },
  );

  const { mutate: setStatus } = useMutation(
    (assignmentId: string, status: AssignmentStatus) =>
      assignmentsService.setStatus(assignmentId, status),
    { success: "Assignment updated.", onDone: () => void refetch() },
  );

  const { mutate: remove, pending: removingPending } = useMutation(
    (assignmentId: string) => assignmentsService.remove(assignmentId),
    { success: "Tasker removed from the project.", onDone: () => void refetch() },
  );

  const assignedIds = useMemo(
    () => new Set((data?.taskers ?? []).map((entry) => entry.tasker?.id).filter(Boolean) as string[]),
    [data],
  );

  return (
    <>
      <Modal
        open={!!project}
        onOpenChange={(open) => !open && onClose()}
        title={project?.project_name ?? "Project team"}
        description={
          data
            ? `${data.total_taskers} assigned · default rate ${formatCurrency(data.project.default_rate)}/hr`
            : "Taskers assigned to this project."
        }
      >
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={() => setAdding(true)}>
            <UserPlus className="h-3.5 w-3.5" /> Assign taskers
          </Button>
        </div>

        <AsyncSection
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={!data?.taskers.length}
          empty={
            <EmptyState
              icon={UserPlus}
              title="No taskers assigned"
              description="Assign someone before they can log tasks against this project."
              action={
                <Button size="sm" onClick={() => setAdding(true)}>
                  Assign taskers
                </Button>
              }
            />
          }
        >
          <ul className="space-y-2">
            {(data?.taskers ?? []).map((entry) => (
              <li
                key={entry.assignment_id}
                className="rounded-xl border border-line bg-ink2/50 p-3"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar
                    name={entry.tasker?.full_name ?? "?"}
                    src={entry.tasker?.avatar}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-frost">
                      {entry.tasker?.full_name ?? "Unknown"}
                    </p>
                    <p className="truncate text-xs text-mist">{entry.tasker?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Remove from project"
                    className="text-bad hover:bg-bad/10"
                    onClick={() => setRemoving(entry)}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <SelectFilter
                    label="Assignment status"
                    value={entry.status}
                    onChange={(next) => void setStatus(entry.assignment_id, next as AssignmentStatus)}
                    options={STATUS_OPTIONS}
                    allLabel={null}
                  />
                  <div className="text-xs text-dim">
                    <p>
                      Rate:{" "}
                      <span className="text-frost">
                        {formatCurrency(entry.custom_rate ?? data?.project.default_rate ?? 0)}/hr
                      </span>
                      {entry.custom_rate == null && " (project default)"}
                    </p>
                    <p className="mt-0.5">Assigned {formatDate(entry.assigned_at)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </AsyncSection>
      </Modal>

      <AssignTaskersDialog
        open={adding}
        onOpenChange={setAdding}
        project={project}
        alreadyAssigned={assignedIds}
        onAssigned={() => void refetch()}
      />

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove from project?"
        confirmLabel="Remove"
        pending={removingPending}
        message={
          <>
            <span className="font-semibold text-frost">{removing?.tasker?.full_name}</span> will no
            longer be able to log tasks against this project. Their existing entries and invoices
            are kept.
          </>
        }
        onConfirm={async () => {
          if (!removing) return;
          await remove(removing.assignment_id);
          setRemoving(null);
        }}
      />
    </>
  );
}

function AssignTaskersDialog({
  open,
  onOpenChange,
  project,
  alreadyAssigned,
  onAssigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  alreadyAssigned: Set<string>;
  onAssigned: () => void;
}) {
  const { taskers, loading } = useMembers();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [customRate, setCustomRate] = useState("");

  // Only active taskers can be assigned; the backend rejects anyone else.
  const candidates = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return taskers
      .filter((member) => member.status === "ACTIVE" && !alreadyAssigned.has(member.id))
      .filter(
        (member) =>
          !needle || `${member.full_name} ${member.email}`.toLowerCase().includes(needle),
      );
  }, [taskers, alreadyAssigned, search]);

  const { mutate: assign, pending } = useMutation(
    () =>
      assignmentsService.assign({
        project_id: project!.id,
        tasker_ids: selected,
        custom_rate: customRate ? Number(customRate) : null,
      }),
    {
      success: "Taskers assigned.",
      onDone: () => {
        setSelected([]);
        setCustomRate("");
        onAssigned();
        onOpenChange(false);
      },
    },
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Assign taskers"
      description="Only active taskers who aren't already on this project are listed."
      size="sm"
    >
      <div className="space-y-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search taskers…"
          className="sm:max-w-none"
        />

        <TextField
          label="Custom rate ($/hr)"
          type="number"
          min={0}
          step="0.01"
          value={customRate}
          onChange={(event) => setCustomRate(event.target.value)}
          placeholder={project ? String(project.avg_pay) : ""}
          hint="Applies to everyone selected here. Leave blank to use the project default."
        />

        {loading ? (
          <p className="text-sm text-mist">Loading taskers…</p>
        ) : !candidates.length ? (
          <EmptyState title="No one left to assign" description="Every active tasker is already on this project." />
        ) : (
          <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {candidates.map((member) => {
              const checked = selected.includes(member.id);
              return (
                <li key={member.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-ink2/50 p-2.5 transition-colors hover:border-azure/40">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelected((current) =>
                          checked
                            ? current.filter((id) => id !== member.id)
                            : [...current, member.id],
                        )
                      }
                      className="h-4 w-4 accent-azure"
                    />
                    <UserAvatar name={member.full_name} src={member.avatar} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-frost">
                        {member.full_name}
                      </span>
                      <span className="block truncate text-xs text-mist">{member.email}</span>
                    </span>
                    <StatusBadge status={member.status} size="sm" />
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button disabled={!selected.length || pending} onClick={() => void assign()}>
            {pending ? "Assigning…" : `Assign ${selected.length || ""}`.trim()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
