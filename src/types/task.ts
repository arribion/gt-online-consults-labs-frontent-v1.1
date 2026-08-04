export type Member = {
  _id: string;
  full_name: string;
  email: string;
  role?: string;
  avatar?: string;
  status?: string;
  [key: string]: any;
};

export type ProjectAssignment = {
  _id: string;
  project_id: string;
  tasker_id: string;
  status:
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "REMOVED"
    | string;
  custom_rate?: number | null;
  assigned_at?: string;
  removed_at?: string | null;
  updatedAt?: string;
  [key: string]: any;
};

export type TaskerWithAssignment = {
  assignment: ProjectAssignment;
  member?: Member | null;
};
