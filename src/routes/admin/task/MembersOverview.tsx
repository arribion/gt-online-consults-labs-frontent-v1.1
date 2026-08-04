import React, { useMemo } from "react";
import type { Member, ProjectAssignment } from "../../../types/task";

type Props = { members: Member[]; assignments: ProjectAssignment[] };

const MembersOverview: React.FC<Props> = ({ members, assignments }) => {
  const memberStats = useMemo(() => {
    return members.map((member) => {
      const assignedProjects = assignments.filter(
        (a) => a.tasker_id === member._id && a.status !== "REMOVED",
      );
      return {
        ...member,
        projectCount: assignedProjects.length,
        assignments: assignedProjects,
      };
    });
  }, [members, assignments]);

  return (
    <section className="mx-4 my-12">
      <div className="mb-4">
        <h2 className="text-xl text-slate-900 font-bold">
          Members Assignment Overview
        </h2>
        <p className="text-slate-700">
          Overview of taskers and their assigned projects
        </p>
      </div>

      {memberStats.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No members available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {memberStats.map((member) => (
            <div
              key={member._id}
              className={`rounded p-4 border ${member.role === "ADMIN" ? "border-slate-300 bg-slate-50" : "border-slate-400 bg-white"} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">
                    {member.full_name}
                  </p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                  <p className="text-xs text-slate-400 truncate max-w-37.5">
                    {member.email}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-600">
                    {member.projectCount}
                  </div>
                  <div className="text-xs text-gray-500">projects</div>
                </div>
              </div>
              {member.projectCount > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {member.assignments.map((a) => (
                      <span
                        key={a._id}
                        className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded-full">
                        {a.status}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(MembersOverview);
