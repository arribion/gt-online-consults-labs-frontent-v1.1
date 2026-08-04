import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";

type Assignment = {
  _id: string;
  project: {
    _id: string;
    project_name: string;
    status: string;
    avg_pay: number;
    description?: string;
    platform?: string;
    createdAt: string;
  };
  custom_rate: number | null;
  assigned_at: string;
  status: string;
};

const statusBadgeClass = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
      return "bg-green-500 border-green-200";
    case "PENDING":
      return "bg-amber-600 border-amber-200";
    case "CLOSED":
      return "bg-red-600 border-slate-200";
    case "ON_HOLD":
      return "bg-yellow-500 border-yellow-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const MyTask: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/$/, "");
  const url = `${base}/api/v1/project-assignments/my-projects`;

  const fetchAssignments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = axios.create({
        baseURL: base,
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const token = localStorage.getItem("authToken");
      if (token) {
        api.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        });
      }

      const response = await api.get(url);
      const projects: Assignment[] = response.data?.data?.projects || [];
      setAssignments(projects);
    } catch (err) {
      console.error("Error fetching my projects:", err);
      const msg =
        axios.isAxiosError(err) && err.response?.data
          ? (err.response.data as any).message ||
            (err.response.data as any).error ||
            "Could not load your assigned projects."
          : "Could not load your assigned projects.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="mx-4 my-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="font-semibold text-yellow-800">Please log in</p>
          <p className="text-sm text-yellow-700 mt-1">
            You need to be logged in to see your assigned projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 my-6">
      <h1 className="text-2xl font-bold text-sky-500 mb-4">My Tasks</h1>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-slate-600">
          Loading your projects…
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-6 bg-white border rounded shadow-sm text-center text-slate-600">
          <p className="font-medium">No assigned projects</p>
          <p className="text-sm mt-1">
            You currently have no projects assigned.
          </p>
          <button
            onClick={fetchAssignments}
            className="mt-3 bg-sky-600 text-white px-3 py-1 rounded text-sm">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => {
            const project = assignment.project;
            const rate = assignment.custom_rate ?? project.avg_pay;
            return (
              <div
                key={assignment._id}
                className="bg-white border rounded shadow-card p-4">
                <h2
                  className={`text-lg font-semibold ${statusBadgeClass(
                    project.status,
                  )} text-slate-50 p-1 rounded`}>
                  {project.project_name}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {project.description || "No description"}
                </p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded text-white ${statusBadgeClass(
                      project.status,
                    )}`}>
                    Project: {project.status}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${statusBadgeClass(
                      assignment.status,
                    )}`}>
                    Assignment: {assignment.status}
                  </span>
                </div>
                <div className="text-sm text-slate-600 mt-2">
                  {rate && rate > 0
                    ? `${rate.toLocaleString()} KES/hr`
                    : "Rate N/A"}
                  {assignment.custom_rate && (
                    <span className="ml-1 text-xs text-amber-600">
                      (custom)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Assigned at:{" "}
                  {new Date(assignment.assigned_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTask;
