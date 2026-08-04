import { useEffect, useState } from "react";
import { LuCirclePlus, LuX } from "react-icons/lu";
import axios from "axios";
import ProjectUploadForm from "../../components/admin/ProjectUploadForm";
import ProjectsTable from "../../components/admin/ProjectTable";

export interface Project {
  id: string;
  projectName: string;
  platform: string;
  description: string;
  ratePerHour: number;
  status: "ACTIVE" | "PENDING" | "CLOSED";
}

interface ApiProject {
  _id: string;
  project_name: string;
  platform: string;
  description: string;
  avg_pay: number;
  status: "ACTIVE" | "PENDING" | "CLOSED";
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ManageProjects = () => {
  const [showProjectAddForm, setShowProjectAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/projects");

      const mapped: Project[] = response.data.data.map(
        (project: ApiProject) => ({
          id: project._id,
          projectName: project.project_name,
          platform: project.platform,
          description: project.description,
          ratePerHour: Number(project.avg_pay),
          status: project.status,
        }),
      );

      setProjects(mapped);
    } catch (err) {
      setError("Failed loading projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.projectName.toLowerCase().includes(search.toLowerCase()) ||
      project.platform.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreateModal = () => {
    setSelectedProject(null);
    setShowProjectAddForm(true);
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setShowProjectAddForm(true);
  };

  const deleteProject = async (project: Project) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/api/v1/projects/${project.id}`);
        // Refresh the list after deletion
        fetchProjects();
      } catch (err) {
        setError("Failed to delete project");
      }
    }
  };


  const closeModal = () => {
    setShowProjectAddForm(false);
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-500">Manage Projects</h1>

          <p className="mt-2 text-green-600">
            Create new projects and manage existing ones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded border bg-sky-500 text-white px-4 py-2 shadow-sm transition hover:bg-sky-600">
          <LuCirclePlus />
          Add Project
        </button>
      </div>

      <ProjectsTable
        projects={filteredProjects}
        loading={loading}
        error={error}
        search={search}
        setSearch={setSearch}
        refresh={fetchProjects}
        onEdit={openEditModal}
        onDelete={deleteProject}
      />

      {showProjectAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 br p-4">
          <div className="relative w-full max-w-3xl rounded bg-white shadow-xl">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-lg p-1 hover:bg-gray-200">
              <LuX size={22} />
            </button>

            <div className="max-h-[90vh] overflow-y-auto p-6">
              <ProjectUploadForm
                project={selectedProject}
                onSuccess={fetchProjects}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProjects;
