import { Edit, Trash2 } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { LuRefreshCcw } from "react-icons/lu";

export interface Project {
  id: string;
  projectName: string;
  platform: string;
  description: string;
  ratePerHour: number;
  status: "ACTIVE" | "PENDING" | "CLOSED";
}

interface Props {
  projects: Project[];
  loading: boolean;
  error: string;
  search: string;
  setSearch: (value: string) => void;
  refresh: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusColor = (status: Project["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    case "CLOSED":
      return "bg-rose-50 text-rose-700 border-rose-200/60";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const ProjectsTable = ({
  projects,
  loading,
  error,
  search,
  setSearch,
  refresh,
  onDelete,
  onEdit,
}: Props) => {
  return (
    <div className="w-full  mb-[2em] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Projects
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            View, filter and manage client projects.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 duration-300 disabled:cursor-not-allowed disabled:bg-gray-400">
          <LuRefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-gray-100 bg-gray-50/50 p-4">
        <div className="relative max-w-md">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-sky-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="p-4 pl-6">Project</th>
              <th className="p-4">Platform</th>
              <th className="p-4">Rate / Hour</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {loading && projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <LuRefreshCcw className="animate-spin" size={24} />
                    Loading projects...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center font-medium text-red-600">
                  {error}
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="group transition hover:bg-slate-50">
                  <td className="p-4 pl-6 font-semibold text-gray-900">
                    {project.projectName}
                  </td>

                  <td className="p-4 text-gray-600">{project.platform}</td>

                  <td className="p-4">
                    KES {project.ratePerHour.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(
                        project.status,
                      )}`}>
                      {project.status}
                    </span>
                  </td>

                  <td className="p-4 pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(project)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100">
                        <Edit size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(project)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsTable;