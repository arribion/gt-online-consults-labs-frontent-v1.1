import React, { useMemo } from "react";
import type { Project } from "../../../types/projects";
import { ClipboardClock, FileCheck, StickyNoteX } from "lucide-react";

type Props = { projects: Project[] };

const TaskStats: React.FC<Props> = ({ projects }) => {
  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const pending = projects.filter((p) => p.status === "PENDING").length;
    const closed = projects.filter((p) => p.status === "CLOSED").length;
    return { active, pending, closed };
  }, [projects]);

  return (
    <section className="mt-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white border border-slate-300/50 min-h-[8em] shadow-md transform hover:-translate-y-1 p-4 duration-200 rounded-lg">
          <div className="flex justify-between">
            <h2 className="font-semibold text-slate-700 text-lg ">
              Active Task/project
            </h2>
            <span className="bg-green-100 p-2 text-green-500 border border-green-400/40 rounded">
              <FileCheck />
            </span>
          </div>
          <p className="text-3xl font-bold text-green-500 mt-3">{stats.active}</p>
        </div>
        <div className="bg-white border border-slate-300/50 min-h-[8em] shadow-md transform hover:-translate-y-1 p-4 duration-200 rounded-lg">
          <div className="flex justify-between">
            <h2 className="font-semibold text-slate-700 text-lg ">
              Pending Task/project
            </h2>
            <span className="bg-yellow-100 p-2 text-yellow-500 border border-yellow-400/40 rounded">
              <ClipboardClock />
            </span>
          </div>
          <p className="text-3xl font-bold text-yellow-500 mt-3">{stats.pending}</p>
        </div>
        <div className="bg-white border border-slate-300/50 min-h-[8em] shadow-md transform hover:-translate-y-1 p-4 duration-200 rounded-lg">
          <div className="flex justify-between">
            <h2 className="font-semibold text-slate-700 text-lg ">
              Closed Task/project
            </h2>
            <span className="bg-red-100 p-2 text-red-500 border border-red-400/40 rounded">
              <StickyNoteX />
            </span>
          </div>
          <p className="text-3xl font-bold text-red-500 mt-3">{stats.closed}</p>
        </div>
      </div>
    </section>
  );
};

export default React.memo(TaskStats);
