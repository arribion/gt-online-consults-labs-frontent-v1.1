import { apiClient, unwrap } from "./api";
import type {
  ApiEnvelope,
  Assignment,
  AssignTaskersRequest,
  AssignmentStatus,
  MyProject,
  ProjectRoster,
  ProjectTeam,
} from "@/types";

/** `GET /project-assignments/` still keys the id as `_id`; normalise it on the way in. */
type RawAssignment = Omit<Assignment, "id"> & { _id: string };

const normalise = (raw: RawAssignment): Assignment => {
  const { _id, ...rest } = raw;
  return { id: _id, ...rest };
};

/** `my-projects` nests a project keyed `_id`/`createdAt`; the rest of the app uses `id`/`created_at`. */
type RawMyProject = Omit<MyProject, "project"> & {
  project:
    | (Omit<NonNullable<MyProject["project"]>, "id" | "created_at"> & {
        _id: string;
        createdAt: string | null;
      })
    | null;
};

const normaliseMyProject = (raw: RawMyProject): MyProject => {
  if (!raw.project) return { ...raw, project: null };
  const { _id, createdAt, ...rest } = raw.project;
  return { ...raw, project: { id: _id, created_at: createdAt, ...rest } };
};

export const assignmentsService = {
  list: async (): Promise<Assignment[]> => {
    const { data } = await apiClient.get<ApiEnvelope<RawAssignment[]>>("/project-assignments/");
    return unwrap(data).map(normalise);
  },

  /** Admin view of one project's roster, including each tasker's custom rate. */
  roster: async (projectId: string): Promise<ProjectRoster> => {
    const { data } = await apiClient.get<ApiEnvelope<ProjectRoster>>(
      `/project-assignments/project/${projectId}`,
    );
    return unwrap(data);
  },

  assign: async (payload: AssignTaskersRequest): Promise<void> => {
    await apiClient.post("/project-assignments/assign", payload);
  },

  setStatus: async (assignmentId: string, status: AssignmentStatus): Promise<void> => {
    await apiClient.patch(`/project-assignments/${assignmentId}`, { status });
  },

  /** Soft remove — sets the assignment to REMOVED and stamps `removed_at`. */
  remove: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/project-assignments/${assignmentId}/remove`);
  },

  /** The signed-in tasker's own projects. */
  myProjects: async (): Promise<MyProject[]> => {
    const { data } =
      await apiClient.get<ApiEnvelope<{ projects: RawMyProject[]; total: number }>>(
        "/project-assignments/my-projects",
      );
    return unwrap(data).projects.map(normaliseMyProject);
  },

  /** Fellow taskers on a project — 403s unless the caller is assigned to it. */
  team: async (projectId: string): Promise<ProjectTeam> => {
    const { data } = await apiClient.get<ApiEnvelope<ProjectTeam>>(
      `/project-assignments/project/${projectId}/taskers`,
    );
    return unwrap(data);
  },
};
