import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Project {
  _id: string;
  project_name: string;
}

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

const ResourceUploadForm = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/projects`);
        const list = res.data?.data ?? res.data ?? [];
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0]._id);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    if (BASE_URL) fetchProjects();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setMessage({ type: "error", text: "Please select a project." });
      return;
    }
    if (!file) {
      setMessage({ type: "error", text: "Please select a file to upload." });
      return;
    }
    if (!title || !description || !version) {
      setMessage({
        type: "error",
        text: "Title, description and version are required.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectID", selectedProjectId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("version", version);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/resources/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (response.data?.success) {
        setMessage({
          type: "success",
          text: "Resource uploaded successfully!",
        });
        // Clear form
        setTitle("");
        setDescription("");
        setVersion("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage({
          type: "error",
          text: response.data?.message || "Upload failed.",
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Upload error.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Resource</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}>
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Project Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="mt-1 w-full border rounded p-2"
            required>
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Instruction document"
            className="mt-1 w-full border rounded p-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description / Note
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Review before deadline"
            className="mt-1 w-full border rounded p-2"
            required
          />
        </div>

        {/* Version */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="v1.0"
            className="mt-1 w-full border rounded p-2"
            required
          />
        </div>

        {/* File Input – now supports ZIP and audio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            File
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="
              image/*,
              application/pdf,
              video/*,
              audio/*,
              application/msword,
              application/vnd.openxmlformats-officedocument.wordprocessingml.document,
              application/zip,
              application/x-zip-compressed,
              .zip
            "
            className="mt-1 w-full border rounded p-2"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Allowed: Images, PDFs, videos, audio files, Word documents, ZIP
            archives (max 20MB)
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Upload size={18} />
          )}
          {loading ? "Uploading..." : "Upload Resource"}
        </button>
      </div>
    </form>
  );
};

export default ResourceUploadForm;
