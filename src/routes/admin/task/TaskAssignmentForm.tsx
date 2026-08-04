import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { Member } from "../../../types/task";

type Props = {
  projectRate: number;
  availableMembers: Member[];
  onAssign: (taskerIds: string[], customRate: number | null) => Promise<void>;
  onCancel: () => void;
};

const TaskAssignmentForm: React.FC<Props> = ({
  projectRate,
  availableMembers,
  onAssign,
  onCancel,
}) => {
  const [selectedTaskers, setSelectedTaskers] = useState<string[]>([]);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleTaskerSelection = (taskerId: string) => {
    setSelectedTaskers((prev) =>
      prev.includes(taskerId)
        ? prev.filter((id) => id !== taskerId)
        : [...prev, taskerId],
    );
  };

  const handleSubmit = async () => {
    if (selectedTaskers.length === 0) return;
    setSubmitting(true);
    try {
      await onAssign(selectedTaskers, customRate);
      setSelectedTaskers([]);
      setCustomRate(null);
      onCancel();
    } catch (err) {
      console.error("Error assigning taskers:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const allIds = availableMembers.map((m) => m._id);
  const handleSelectAll = () => {
    setSelectedTaskers((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded border">
      <div className="mb-3">
        <h4 className="font-semibold mb-2">Project Custom Rate</h4>
        <div className="flex items-center gap-3">
          <input
            id="customRate"
            type="number"
            placeholder="Custom Rate (KES/hr)"
            className="w-48 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={customRate ?? ""}
            onChange={(e) =>
              setCustomRate(e.target.value ? Number(e.target.value) : null)
            }
          />
          <span className="text-sm text-gray-500">
            Default: {projectRate} KES/hr
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Assign Taskers</h4>
        {availableMembers.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-sm text-sky-600 hover:text-sky-800"
            aria-label="Select all taskers">
            {selectedTaskers.length === availableMembers.length
              ? "Deselect All"
              : "Select All"}
          </button>
        )}
      </div>

      {availableMembers.length === 0 ? (
        <p className="text-sm text-gray-500">No available taskers to assign.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-3 p-2 bg-white rounded border hover:border-sky-300 transition-colors">
              <input
                type="checkbox"
                checked={selectedTaskers.includes(member._id)}
                onChange={() => toggleTaskerSelection(member._id)}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{member.full_name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSubmit}
          disabled={selectedTaskers.length === 0 || submitting}
          className="bg-sky-600 text-white px-4 py-2 rounded flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-sky-700 transition-colors">
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Assigning...
            </>
          ) : (
            <>
              <Check size={16} />
              Assign {selectedTaskers.length} Tasker
              {selectedTaskers.length > 1 ? "s" : ""}
            </>
          )}
        </button>
        <button
          onClick={() => {
            setSelectedTaskers([]);
            setCustomRate(null);
            onCancel();
          }}
          className="border px-4 py-2 rounded flex-1 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TaskAssignmentForm;
