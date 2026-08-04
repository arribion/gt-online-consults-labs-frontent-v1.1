import { useEffect, useState } from "react";
import axios from "axios";
import { FileText } from "lucide-react";
import ResourceCard from "../../components/client/resources/ResourceCard";
import type { Resource } from "../../components/client/resources/ResourceCard";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/api/v1/resources/get");

      // Extract array from response
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      }

      // Map backend fields to frontend Resource type
      const mapped = list.map((item) => ({
        id: item._id || item.id, // use _id from backend
        title: item.title,
        description: item.description,
        version: item.version,
        type: item.type || "raw", // image | video | raw
        fileUrl: item.fileUrl || item.url || item.secure_url,
        publicId: item.publicId,
        createdAt: item.createdAt,
      }));

      setResources(mapped);
    } catch (err) {
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <section className="min-h-[80.8vh] bg-gray-50 px-4 pb-10 pt-2">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            PROJECT <span className="text-sky-500">RESOURCES</span>
          </h1>
          <p className="mt-2 text-slate-500">Get All project guides.</p>
        </div>

        {loading && (
          <div className="py-20 text-center text-gray-500">
            Loading resources...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p>{error}</p>
            <button
              onClick={fetchResources}
              className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && resources.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex w-fit items-center justify-center rounded-full bg-gray-100 p-4 text-gray-500">
              <FileText size={34} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              No Resources Found
            </h2>
            <p className="mt-2 text-gray-500">
              The admin has not uploaded any files yet.
            </p>
            <button
              onClick={fetchResources}
              className="mt-6 inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Resources;