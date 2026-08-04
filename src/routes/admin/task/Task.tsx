import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import type { Project } from "../../../types/projects";
import type { Member, ProjectAssignment } from "../../../types/task";
import TaskStats from "./TaskStats";
import TaskCard from "./TaskCard";
import MembersOverview from "./MembersOverview";
import toast from "react-hot-toast";

type Props = {
  initialProjects?: Project[];
};

const Task: React.FC<Props> = ({ initialProjects = [] }) => {
  const [projects, setProjects] = useState<Project[]>(() => initialProjects);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true); // initial loader only
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";
  const isMounted = useRef(true);
  const initialLoadDone = useRef(false); // track initial load to avoid toggling loader repeatedly

  // stable helper
  const getColorClass = useCallback((status: string): string => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "border-emerald-500";
      case "PENDING":
        return "border-amber-500";
      case "CLOSED":
        return "border-slate-500";
      case "ON_HOLD":
        return "border-yellow-500";
      default:
        return "border-slate-300";
    }
  }, []);

  // Fetch all assignments (top-level) or fallback to per-project; always return a flat array
  const fetchAllAssignments = useCallback(
    async (projectIds: string[]) => {
      try {
        const resp = await axios.get(`${BASE_URL}/api/v1/project-assignments`);
        const data = resp.data?.data || [];
        // If backend returns an object with nested structure, normalize to flat array
        if (Array.isArray(data)) return data;
        // fallback: if data.taskers or similar, try to flatten
        if (Array.isArray(resp.data?.data?.taskers))
          return resp.data.data.taskers;
        return [];
      } catch (err: any) {
        const status = err?.response?.status;
        // fallback to per-project endpoints if top-level missing
        if (status === 404 || status === 405 || !status) {
          try {
            const results = await Promise.all(
              projectIds.map((pid) =>
                axios
                  .get(`${BASE_URL}/api/v1/project-assignments/project/${pid}`)
                  .then((r) => {
                    // controller returns { data: { taskers: [...] } } in our design
                    const t = r.data?.data;
                    // if it's the structured response, map to flat assignment objects
                    if (Array.isArray(t?.taskers)) {
                      // convert each item to a consistent assignment shape
                      return t.taskers.map((x: any) => ({
                        _id: x.assignment_id ?? x._id,
                        project_id: pid,
                        tasker_id: x.tasker?._id ?? x.tasker_id,
                        status: x.assignment_status ?? x.status ?? "ASSIGNED",
                        custom_rate: x.custom_rate ?? null,
                        assigned_at: x.assigned_at ?? null,
                      }));
                    }
                    // if endpoint returned a flat array already
                    if (Array.isArray(r.data?.data)) return r.data.data;
                    return [];
                  })
                  .catch(() => []),
              ),
            );
            return results.flat();
          } catch (fallbackErr) {
            console.error("Fallback assignments fetch failed:", fallbackErr);
            return [];
          }
        }
        console.error("Error fetching assignments:", err);
        return [];
      }
    },
    [BASE_URL],
  );

  // Single fetch that runs on mount. Use local vars and set state once to avoid flicker.
  const fetchData = useCallback(async () => {
    // Only show loader on the very first load
    if (!initialLoadDone.current) setLoading(true);
    setError(null);

    if (!BASE_URL) console.warn("VITE_BASE_URL is not set. Requests may fail.");

    // Fetch projects, members in parallel to reduce UI churn
    try {
      const [projectsResp, membersResp] = await Promise.allSettled([
        axios.get(`${BASE_URL}/api/v1/projects`),
        axios.get(`${BASE_URL}/api/v1/members`),
      ]);

      // Prepare projects local variable
      let fetchedProjects: Project[] = [];
      if (projectsResp.status === "fulfilled") {
        const projectsData = projectsResp.value.data?.data || [];
        if (Array.isArray(projectsData) && projectsData.length > 0) {
          fetchedProjects = projectsData.map((p: any) => ({
            id: p._id,
            name: p.project_name,
            status: p.status || "PENDING",
            colorClass: getColorClass(p.status),
            tags: [p.platform || "General"],
            taskers: p.taskers || [],
            rate: p.avg_pay || 0,
            description: p.description,
            revenueSplit: p.revenueSplit,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }));
        } else if (initialProjects.length > 0) {
          fetchedProjects = initialProjects;
        } else {
          fetchedProjects = [];
        }
      } else {
        // projects fetch failed
        console.error("Error fetching projects:", projectsResp.reason);
        if (initialProjects.length > 0) fetchedProjects = initialProjects;
        else fetchedProjects = [];
      }

      // Prepare members local variable
      let fetchedMembers: Member[] = [];
      if (membersResp.status === "fulfilled") {
        const membersData = membersResp.value.data?.data || [];
        fetchedMembers = Array.isArray(membersData)
          ? membersData.filter((m: any) => m.role === "TASKER")
          : [];
      } else {
        console.error("Error fetching members:", membersResp.reason);
        fetchedMembers = [];
      }

      // Fetch assignments (use project ids from fetchedProjects)
      const projectIds = fetchedProjects.map((p) => String(p.id));
      const fetchedAssignments = await fetchAllAssignments(projectIds);

      // Commit to state once — this prevents intermediate empty renders
      if (isMounted.current) {
        setProjects(fetchedProjects);
        setMembers(fetchedMembers);
        setAssignments(
          Array.isArray(fetchedAssignments) ? fetchedAssignments : [],
        );
      }

      initialLoadDone.current = true;
      if (isMounted.current) setLoading(false);
    } catch (err) {
      console.error("Error in fetchData:", err);
      if (isMounted.current) {
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    }
  }, [BASE_URL, fetchAllAssignments, getColorClass, initialProjects]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // Helpers used by TaskCard and children
  const getProjectTaskers = useCallback(
    (projectId: string) => {
      const projectAssignments = assignments.filter(
        (a) =>
          String(a.project_id) === String(projectId) && a.status !== "REMOVED",
      );
      return projectAssignments.map((a) => {
        const member = members.find(
          (m) => String(m._id) === String(a.tasker_id),
        );
        return { assignment: a, member };
      });
    },
    [assignments, members],
  );

  const getAvailableMembers = useCallback(
    (projectId: string) => {
      const assignedIds = new Set(
        assignments
          .filter(
            (a) =>
              String(a.project_id) === String(projectId) &&
              a.status !== "REMOVED",
          )
          .map((a) => String(a.tasker_id)),
      );
      return members.filter(
        (m) => m.role === "TASKER" && !assignedIds.has(String(m._id)),
      );
    },
    [assignments, members],
  );

  const getProjectCustomRate = useCallback(
    (projectId: string) => {
      const projectAssignments = assignments.filter(
        (a) =>
          String(a.project_id) === String(projectId) && a.status !== "REMOVED",
      );
      return projectAssignments.length > 0
        ? projectAssignments[0].custom_rate ?? null
        : null;
    },
    [assignments],
  );

  // Assign taskers
  const handleAssignTaskers = useCallback(
    async (
      projectId: string,
      taskerIds: string[],
      customRate: number | null,
    ) => {
      if (taskerIds.length === 0) {
        toast.error("Please select at least one tasker");
        return;
      }
      setSubmitting(true);
      try {
        await axios.post(`${BASE_URL}/api/v1/project-assignments/assign`, {
          project_id: projectId,
          tasker_ids: taskerIds,
          custom_rate: customRate,
        });

        // Refresh assignments only (do not clear projects)
        const refreshed = await fetchAllAssignments(
          projects.map((p) => String(p.id)),
        );
        if (isMounted.current) setAssignments(refreshed);
        toast.success(`${taskerIds.length} tasker(s) assigned successfully`);
      } catch (err: any) {
        console.error("Error assigning taskers:", err.response?.data);
        const msg =
          err.response?.data?.message ||
          "Failed to assign taskers. Please try again.";
        toast.error(msg);
        throw err;
      } finally {
        if (isMounted.current) setSubmitting(false);
      }
    },
    [BASE_URL, fetchAllAssignments, projects],
  );

  // Remove tasker
  const handleRemoveTasker = useCallback(
    async (assignmentId: string) => {
      if (
        !confirm(
          "Are you sure you want to remove this tasker from the project?",
        )
      )
        return;
      try {
        await axios.delete(
          `${BASE_URL}/api/v1/project-assignments/${assignmentId}/remove`,
        );
        if (isMounted.current) {
          setAssignments((prev) =>
            prev.map((a) =>
              a._id === assignmentId
                ? {
                    ...a,
                    status: "REMOVED",
                    removed_at: new Date().toISOString(),
                  }
                : a,
            ),
          );
        }
      } catch (err) {
        console.error("Error removing tasker:", err);
        toast.error("Failed to remove tasker. Please try again.");
        throw err;
      }
    },
    [BASE_URL],
  );

  // Update assignment status
  const handleUpdateAssignmentStatus = useCallback(
    async (assignmentId: string, status: string) => {
      try {
        const updatedStatus = status as ProjectAssignment["status"];
        await axios.patch(
          `${BASE_URL}/api/v1/project-assignments/${assignmentId}`,
          { status: updatedStatus },
        );
        if (isMounted.current) {
          setAssignments((prev) =>
            prev.map((a) =>
              a._id === assignmentId ? { ...a, status: updatedStatus } : a,
            ),
          );
        }
      } catch (err) {
        console.error("Error updating assignment status:", err);
        toast.error("Failed to update assignment status. Please try again.");
        throw err;
      }
    },
    [BASE_URL],
  );

  const handleRetry = useCallback(() => {
    setError(null);
    // keep current UI visible while retrying; only show loader if initial load not done
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="pt-[16em] text-center text-slate-600">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
          <span>Loading projects and members…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={handleRetry}
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 my-5">
      <h1 className="text-2xl my-4 text-sky-500 font-bold">TASKS</h1>

      <TaskStats projects={projects} />
      <section className="mx-4 my-12">
        <h2 className="text-xl font-bold mb-2">Task Assignment</h2>
        <p className="mb-4 text-gray-600">
          Assign taskers to projects and manage their assignments. Set a custom
          rate for the entire project.
        </p>

        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No projects available. Create a project first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const projectTaskers = getProjectTaskers(String(project.id));
              const availableMembers = getAvailableMembers(String(project.id));
              const customRate = getProjectCustomRate(String(project.id));

              return (
                <TaskCard
                  key={String(project.id)}
                  project={project}
                  projectTaskers={projectTaskers}
                  availableMembers={availableMembers}
                  customRate={customRate}
                  onAssignTaskers={handleAssignTaskers}
                  onRemoveTasker={handleRemoveTasker}
                  onUpdateStatus={handleUpdateAssignmentStatus}
                  isSubmitting={submitting}
                />
              );
            })}
          </div>
        )}
      </section>

      <MembersOverview members={members} assignments={assignments} />
    </div>
  );
};

export default Task;