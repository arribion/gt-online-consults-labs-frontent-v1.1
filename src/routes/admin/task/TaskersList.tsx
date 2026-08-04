import React, { useState } from "react";
import { Loader2, Trash2,  } from "lucide-react";
import type { TaskerWithAssignment } from "../../../types/task";

type Props = {
  taskers: TaskerWithAssignment[];
  onRemove: (assignmentId: string) => Promise<void>;
};

const TaskersList: React.FC<Props> = ({ taskers, onRemove }) => {
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  const handleRemove = async (assignmentId: string) => {
    if (!window.confirm("Are you sure you want to remove this tasker?")) return;
    try {
      setRemoving((s) => ({ ...s, [assignmentId]: true }));
      await onRemove(assignmentId);
    } catch (err) {
      console.error("Error removing tasker:", err);
    } finally {
      setRemoving((s) => ({ ...s, [assignmentId]: false }));
    }
  };

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full bg-white shadow-md border border-gray-200">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th scope="col" className="p-3 text-left text-sm font-semibold">
              Tasker
            </th>
            <th scope="col" className="p-3 text-left text-sm font-semibold">
              Status
            </th>
            <th scope="col" className="p-3 text-left text-sm font-semibold">
              Rate
            </th>
            <th scope="col" className="p-3 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {taskers.length > 0 ? (
            taskers.map(({ assignment, member }) => (
              <tr
                key={assignment._id}
                className="hover:bg-slate-50 transition-colors duration-150">
                <td className="p-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {member?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member?.email || "No email"}
                    </p>
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      assignment.status === "ASSIGNED"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : assignment.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : assignment.status === "COMPLETED"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="p-3">
                  {assignment.custom_rate
                    ? `${assignment.custom_rate} KES/hr`
                    : "Default"}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    aria-label={`Remove ${member?.full_name || "tasker"}`}
                    onClick={() => handleRemove(assignment._id)}
                    disabled={!!removing[assignment._id]}
                    className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded">
                    {removing[assignment._id] ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <button className="gap-2 bg-red-100 hover:bg-red-200 rounded px-2 py-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No taskers assigned
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(TaskersList);
