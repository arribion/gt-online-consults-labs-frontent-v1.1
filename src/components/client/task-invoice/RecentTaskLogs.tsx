import { useEffect, useState } from "react";

type RecentTaskLogRow = {
  task_ref?: string;
  units_hours?: string | number;
  time_seconds?: string | number;
  entry_date?: string;
  status?: string;
};

const RecentTaskLogs = ({
  taskerId = window.CURRENT_TASKER_ID || "",
  projectId = window.CURRENT_PROJECT_ID || "",
}) => {
  const [rows, setRows] = useState<RecentTaskLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      setError("");
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
        const cleanBaseUrl = baseUrl.endsWith("/")
          ? baseUrl.slice(0, -1)
          : baseUrl;
        const q = new URLSearchParams();
        if (taskerId) q.set("taskerId", taskerId);
        if (projectId) q.set("projectId", projectId);
        const res = await fetch(
          `${cleanBaseUrl}/api/v1/tasks/recent?${q.toString()}`,
        );
        if (!res.ok) throw new Error(`Server ${res.status}`);
        const data = await res.json();
        setRows(data || []);
      } catch (err) {
        setError("Failed to load recent logs");
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [taskerId, projectId]);

  if (loading) return <div className="p-4">Loading recent logs...</div>;
  if (error) return <div className="p-4 text-rose-500">{error}</div>;
  if (!rows.length)
    return <div className="p-4 text-slate-500">No recent logs</div>;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        Recent Task Logs
      </h3>
      <div className="overflow-auto max-h-48 border rounded">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Task Ref</th>
              <th className="p-2 text-left">Units/Hours</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.task_ref}</td>
                <td className="p-2">{r.units_hours ?? r.time_seconds ?? ""}</td>
                <td className="p-2">
                  {r.entry_date
                    ? new Date(r.entry_date).toLocaleDateString()
                    : ""}
                </td>
                <td className="p-2">{r.status || "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTaskLogs;
