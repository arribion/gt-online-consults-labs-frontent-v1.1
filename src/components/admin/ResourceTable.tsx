import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download, Trash2, RefreshCcw, Search } from "lucide-react";

export type Resource = {
  id: string; // MongoDB _id
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url: string;
  version?: string;
  publicId?: string;
  description?: string;
};

const DEFAULT_BASE = import.meta.env.VITE_BASE_URL ?? "";
if (!DEFAULT_BASE) {
  console.warn("VITE_BASE_URL is not defined.");
}

const ResourceTable: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const api = axios.create({
    baseURL: DEFAULT_BASE || "",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  const mapBackendToResource = (r: any): Resource => {
    const id = r._id ?? r.publicId ?? String(Math.random());
    const name =
      r.title ?? (r.fileUrl ? r.fileUrl.split("/").pop() : "unknown");
    const type = r.type ?? "file";
    const size = r.size ? String(r.size) : "—";
    const uploadedAt = r.createdAt ?? r.uploadedAt ?? new Date().toISOString();
    const url = r.fileUrl ?? r.url ?? r.secure_url ?? "";

    return {
      id,
      name,
      type,
      size,
      uploadedAt,
      url,
      version: r.version,
      publicId: r.publicId,
      description: r.description || "",
    };
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/v1/resources/get");
      const payload = res?.data;
      let list: any[] = [];

      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload?.data)) {
        list = payload.data;
      } else if (Array.isArray(payload?.resources)) {
        list = payload.resources;
      }

      const mapped = list.map(mapBackendToResource);
      setResources(mapped);
    } catch (err) {
      console.error("Failed to load resources:", err);
      setError("Failed to load resources.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;
    try {
      await api.delete(`/api/v1/resources/delete/${id}`);
      setResources((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete resource:", err);
      alert("Failed to delete the resource item. Check console for details.");
    }
  };

  // Helper file format checker functions
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  const isVideo = (url: string) => /\.(mp4|mov|avi|webm|mkv)$/i.test(url);
  const isPdf = (url: string) => /\.pdf$/i.test(url);

  const filteredResources = resources.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-4 w-full">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by file name, type or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
          />
        </div>
        <button
          onClick={fetchResources}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-50">
          <RefreshCcw
            size={16}
            className={loading ? "animate-spin text-sky-500" : ""}
          />
          Reload List
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCcw className="animate-spin text-sky-500" size={24} />
            <span className="text-sm font-medium">Loading resources...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 flex flex-col items-center gap-3">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchResources}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-semibold">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <th className="p-4">Preview</th>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Uploaded At</th>
                  <th className="p-4">Version</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      No matching resource records located.
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-sky-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="h-16 w-24 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:border-sky-200 transition-colors">
                          {isImage(item.url) && (
                            <img
                              src={
                                item.url || "https://placehold.net/400x400.png"
                              }
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                          {isVideo(item.url) && (
                            <video
                              src={item.url}
                              className="h-full w-full object-cover"
                              controls
                              muted
                            />
                          )}
                          {isPdf(item.url) && (
                            <div className="flex flex-col items-center text-red-500">
                              <FileText size={24} />
                              <span className="text-[10px] font-bold mt-0.5">
                                PDF
                              </span>
                            </div>
                          )}
                          {!isImage(item.url) &&
                            !isVideo(item.url) &&
                            !isPdf(item.url) && (
                              <FileText size={24} className="text-gray-400" />
                            )}
                        </div>
                      </td>

                      <td className="p-4 font-medium text-gray-900 break-all max-w-xs">
                        <h1 className="text-[18px]">{item.name}</h1>
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs wrap-break-word">
                        {item.description || "—"}
                      </td>
                      <td className="p-4 text-gray-500 capitalize">
                        {item.type}
                      </td>
                      <td className="p-4 text-gray-500">{item.size}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-500">
                        {item.version || "—"}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 text-xs font-medium">
                            <Download size={14} /> View
                          </a>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 text-xs font-medium">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceTable;