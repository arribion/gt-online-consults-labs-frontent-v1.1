import { useEffect, useState } from "react";
import axios from "axios";
import { LuRefreshCcw } from "react-icons/lu";
import { FiSearch } from "react-icons/fi";

interface Project {
  id: string;
  projectName: string;
  platform: string;
  description: string;
  ratePerHour: number;
  status: "ACTIVE" | "PENDING" | "CLOSED";
}

interface ExpressProjectPayload {
  _id: string;
  project_name: string;
  platform: string;
  description: string;
  avg_pay: number;
  status: "ACTIVE" | "PENDING" | "CLOSED";
}

interface ProjectsResponse {
  success: boolean;
  count: number;
  data: ExpressProjectPayload[];
}

const getBadgeColor = (status: Project["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    case "CLOSED":
      return "bg-rose-50 text-rose-700 border-rose-200/60";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200/60";
  }
};

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get<ProjectsResponse>(
        `${import.meta.env.VITE_BASE_URL}/api/v1/projects`,
      );

      if (!data.success) {
        throw new Error("Failed to fetch projects.");
      }

      const mappedProjects: Project[] = data.data.map((proj) => ({
        id: proj._id,
        projectName: proj.project_name,
        platform: proj.platform,
        description: proj.description,
        ratePerHour: Number(proj.avg_pay),
        status: proj.status,
      }));
      setProjects(mappedProjects);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string })?.message ?? err.message,
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter project dataset dynamically against name, platform channel, or description parameters
  const filteredProjects = projects.filter(
    (project) =>
      project.projectName.toLowerCase().includes(search.toLowerCase()) ||
      project.platform.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Top Main Header Panel Component Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 p-6 bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            All Projects
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View, audit, and track active platform invoice workflows.
          </p>
        </div>
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed">
          <LuRefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Interactive Sub-Toolbar Filter Input */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="relative max-w-md">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, channel, or keywords..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-900/5 transition-all"
          />
        </div>
      </div>

      {/* Presentational Status Intercept Handlers */}
      {loading && projects.length === 0 ? (
        <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <LuRefreshCcw className="animate-spin text-gray-400" size={24} />
          <span className="text-sm font-medium">
            Fetching projects ...
          </span>
        </div>
      ) : error ? (
        <div className="p-16 text-center text-rose-600 bg-rose-50/10 flex flex-col items-center gap-3">
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 border border-rose-200 text-rose-700 bg-white rounded-xl text-xs font-semibold hover:bg-rose-50 transition">
            Retry Call
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-16 text-center text-gray-400 font-medium">
          No matching operational project tracks discovered.
        </div>
      ) : (
        /* Core Presentational Data Grid Layer */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Project Details</th>
                <th className="px-6 py-4">Platform Channel</th>
                <th className="px-6 py-4 max-w-xs">Scope Description</th>
                <th className="px-6 py-4">Avg Hourly Rate</th>
                <th className="px-6 py-4">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {project.projectName}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {project.platform}
                  </td>
                  <td className="px-6 py-4 text-gray-400 wrap-break-word max-w-xs text-xs font-medium">
                    {project.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-semibold whitespace-nowrap">
                    KES {project.ratePerHour.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectList;