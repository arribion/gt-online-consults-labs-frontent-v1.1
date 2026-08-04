import { FileText, Download, Eye } from "lucide-react";

export interface Resource {
  id: string;
  title: string;
  description?: string;
  version?: string;
  type: "image" | "video" | "raw";
  fileUrl: string;
  publicId?: string;
  createdAt?: string;
}

interface Props {
  resource: Resource;
}

const ResourceCard = ({ resource }: Props) => {
  const { title, description, version, type, fileUrl } = resource;

  // Helper to get file extension from URL
  const getFileExtension = (url: string) => {
    const parts = url.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  };

  const ext = getFileExtension(fileUrl);
  const isPDF = ext === "pdf";
  const isWord = ext === "doc" || ext === "docx";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Preview area */}
      <div className="relative mb-3 flex h-40 items-center border border-sky-200 justify-center overflow-hidden rounded-lg bg-gray-100">
        {type === "image" && (
          <img
            src={fileUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
        {type === "video" && (
          <video
            controls
            className="h-full w-full object-cover"
            src={fileUrl}
          />
        )}
        {(type === "raw" || !type) && (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <FileText size={48} className="mb-1" />
            <span className="text-xs uppercase">{ext || "file"}</span>
            {isPDF && <span className="text-xs text-red-500">PDF</span>}
            {isWord && <span className="text-xs text-blue-500">Word</span>}
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        )}
        {version && <p className="text-xs text-gray-400">Version: {version}</p>}
        <div className="flex items-center gap-3 pt-2 text-sm">
          {/* Download */}
          <a
            href={fileUrl}
            target="_blank"
            download
            className="inline-flex items-center gap-1 w-full border rounded p-2 text-gray-600 hover:underline">
            <Eye size={16} /> View
          </a>
          {/* Download */}
          <a
            href={fileUrl}
            target="_blank"
            download
            className="inline-flex items-center gap-1 w-full border rounded p-2 text-slate-50 bg-sky-500 hover:bg-sky-600">
            <Download size={16} /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;