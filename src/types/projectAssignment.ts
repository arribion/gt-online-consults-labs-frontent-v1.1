import type { Project } from "./projects";
import type { Member } from "./members";

export type ProjectAssignment = {
  id?: string;
  project_id: Project["id"];
  tasker_id: Member["id"];
  custom_rate?: number | null;
  assigned_at?: string;
  removed_at?: string | null;
  meta?: Record<string, unknown>;
};
