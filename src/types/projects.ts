export type Project = {
  id: string;
  name: string;
  status?: string;
  colorClass?: string;
  tags?: string[];
  taskers?: string[]; // array of user ids
  rate?: number;
  avg_pay?: number;
  description?: string;
  revenueSplit?: any;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};
