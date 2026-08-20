import { useMemo } from "react";
import { useAsync } from "./useAsync";
import { assignmentsService, membersService, projectsService } from "@/services";
import type { Member, MyProject, Project, SelectOption } from "@/types";

/**
 * Reference data the filters on almost every screen need. Kept as hooks so a
 * page asks for "the projects I can pick from" rather than re-deriving that
 * from an assignment list each time.
 */

export function useAllProjects() {
  const { data, loading, error, refetch } = useAsync<Project[]>(
    () => projectsService.list(),
    [],
    [],
  );

  const options = useMemo<SelectOption[]>(
    () =>
      [...data]
        .sort((a, b) => a.project_name.localeCompare(b.project_name))
        .map((project) => ({ value: project.id, label: project.project_name })),
    [data],
  );

  const nameById = useMemo(
    () => new Map(data.map((project) => [project.id, project.project_name])),
    [data],
  );

  return { projects: data, options, nameById, loading, error, refetch };
}

export function useMyProjects() {
  const { data, loading, error, refetch } = useAsync<MyProject[]>(
    () => assignmentsService.myProjects(),
    [],
    [],
  );

  const options = useMemo<SelectOption[]>(
    () =>
      data
        .filter((row) => row.project)
        .map((row) => ({ value: row.project!.id, label: row.project!.project_name })),
    [data],
  );

  const nameById = useMemo(
    () =>
      new Map(
        data.filter((row) => row.project).map((row) => [row.project!.id, row.project!.project_name]),
      ),
    [data],
  );

  /** Only these projects accept task uploads — the backend 403s on the rest. */
  const uploadable = useMemo(
    () =>
      data.filter(
        (row) =>
          row.project &&
          row.status !== "COMPLETED" &&
          row.status !== "CANCELLED" &&
          !["CLOSED", "DEACTIVATED"].includes(row.project.status),
      ),
    [data],
  );

  return { assignments: data, options, nameById, uploadable, loading, error, refetch };
}

/** Admin-only: `GET /members/` 403s for a tasker, so pass `enabled: false` there. */
export function useMembers({ enabled = true }: { enabled?: boolean } = {}) {
  const { data, loading, error, refetch } = useAsync<Member[]>(
    () => membersService.list(),
    [],
    [],
    { enabled },
  );

  const taskers = useMemo(() => data.filter((member) => member.role === "TASKER"), [data]);

  const taskerOptions = useMemo<SelectOption[]>(
    () =>
      [...taskers]
        .sort((a, b) => a.full_name.localeCompare(b.full_name))
        .map((member) => ({ value: member.id, label: member.full_name })),
    [taskers],
  );

  const nameById = useMemo(
    () => new Map(data.map((member) => [member.id, member.full_name])),
    [data],
  );

  return { members: data, taskers, taskerOptions, nameById, loading, error, refetch };
}
