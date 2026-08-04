import  { useState, useEffect } from "react";
import ResourceTable from "../../components/admin/ResourceTable";
import ResourcesUploadForm from "../../components/admin/ResourceUploadForm";
import { Plus } from "lucide-react";

const ManageResources = () => {
  const [showResourceForm, setShowResourceForm] = useState<boolean>(false);

  const handleResourceForm = () => {
    setShowResourceForm(!showResourceForm);
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showResourceForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showResourceForm]);

  return (
    <div className="m-4">
      {/* Header Section */}
      <section className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl text-sky-500 font-semibold">Resources</h1>
          <p>PDF, DOCX, VIDEOS, AUDIO, ZIP</p>
        </div>
        <div>
          <button
            onClick={handleResourceForm}
            className="flex items-center gap-2 border px-3 py-2 rounded-md text-white bg-sky-500 hover:bg-sky-600 transition">
            <Plus size={18} />
            Upload Resources
          </button>
        </div>
      </section>

      {/* Resource Table + Modal */}
      <section className="relative">
        {showResourceForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleResourceForm} // close when clicking outside
          >
            <div
              className="w-full max-w-lg rounded-lg bg-white shadow-xl p-6 relative"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              {/* Close Button */}
              <button
                onClick={handleResourceForm}
                className="absolute right-3 top-3 text-gray-500 hover:bg-gray-100 p-1 rounded">
                ✕
              </button>

              {/* Upload Form */}
              <ResourcesUploadForm />
            </div>
          </div>
        )}
        <ResourceTable />
      </section>
    </div>
  );
};

export default ManageResources;