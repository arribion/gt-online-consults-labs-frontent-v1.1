import React, { useState, useCallback } from "react";
import type { Project } from "../../../types/projects";
import type { TaskerWithAssignment, Member } from "../../../types/task";
import TaskAssignmentForm from "./TaskAssignmentForm";
import TaskersList from "./TaskersList";
import { UserPen } from "lucide-react";

type Props = {
  project: Project;
  projectTaskers: TaskerWithAssignment[];
  availableMembers: Member[];
  customRate: number | null;
  onAssignTaskers: (
    projectId: string,
    taskerIds: string[],
    customRate: number | null,
  ) => Promise<void>;
  onRemoveTasker: (assignmentId: string) => Promise<void>;
  onUpdateStatus: (assignmentId: string, status: string) => Promise<void>;
  isSubmitting?: boolean;
};

const TaskCard: React.FC<Props> = ({
  project,
  projectTaskers,
  availableMembers,
  onAssignTaskers,
  onRemoveTasker,
}) => {
  const [openFormFor, setOpenFormFor] = useState<Project["id"] | null>(null);
  const handleAssign = useCallback(
    async (taskerIds: string[], rate: number | null) => {
      await onAssignTaskers(String(project.id), taskerIds, rate);
    },
    [onAssignTaskers, project.id],
  );

  const isClosed = project.status === "CLOSED";

  return (
    <div
      className={`p-4 bg-white rounded border-2 ${project.colorClass || "border-slate-200"}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {project.description || "No description"}
          </p>
          <div className="mt-2 text-xs text-gray-600">
            <span className="mr-3">
              Rate: <strong>{project.rate ?? "N/A"}</strong>
            </span>
            <span>
              Status:{" "}
              <strong className="text-green-500">{project.status}</strong>
            </span>
          </div>
        </div>

        {/* Assign button or red "Closed" badge */}
        <div className="flex flex-col items-end gap-2">
          {!isClosed ? (
            <button
              type="button"
              onClick={() => setOpenFormFor((s) => (!s ? project.id : null))}
              className="bg-sky-600 text-white px-3 py-1 rounded text-sm hover:bg-sky-700 flex items-center gap-2">
              <UserPen size={16} />
              {openFormFor === project.id ? "Close" : "Assign"}
            </button>
          ) : (
            <span className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded">
              Closed
            </span>
          )}
        </div>
      </div>

      {openFormFor === project.id && !isClosed && (
        <TaskAssignmentForm
          projectRate={project.rate ?? 0}
          availableMembers={availableMembers}
          onAssign={handleAssign}
          onCancel={() => setOpenFormFor(null)}
        />
      )}

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Assigned Taskers</h4>
        <TaskersList taskers={projectTaskers} onRemove={onRemoveTasker} />
      </div>
    </div>
  );
};

export default React.memo(TaskCard);