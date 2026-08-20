import { Download, ExternalLink, FileText, Film, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/common";
import { formatDate } from "@/lib/format";
import type { Resource } from "@/types";

const TYPE_ICON = {
  image: ImageIcon,
  video: Film,
  raw: FileText,
} as const;

/**
 * Resources as cards rather than a table: an image resource is best identified
 * by looking at it, and the grid reflows from one column on a phone to three on
 * a desktop without a horizontal scroll.
 */
export function ResourceGrid({
  resources,
  projectName,
  onDelete,
}: {
  resources: Resource[];
  projectName: (projectId: string) => string;
  /** Omit for read-only viewers — deletion is admin-only server-side anyway. */
  onDelete?: (resource: Resource) => void;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => {
        const Icon = TYPE_ICON[resource.type] ?? FileText;
        return (
          <li key={resource.id}>
            <Panel padded={false} className="flex h-full flex-col overflow-hidden">
              <div className="relative aspect-video bg-ink2">
                {resource.type === "image" ? (
                  <img
                    src={resource.file_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : resource.type === "video" ? (
                  <video src={resource.file_url} controls preload="metadata" className="h-full w-full" />
                ) : (
                  <div className="grid h-full place-items-center">
                    <Icon className="h-8 w-8 text-dim" />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-md border border-line2/60 bg-deep/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky2 backdrop-blur">
                  {resource.type}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="truncate font-display text-sm font-semibold text-frost">
                  {resource.title}
                </h3>
                <p className="mt-0.5 truncate text-xs text-dim">
                  {projectName(resource.project_id)} · v{resource.version}
                </p>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-mist">{resource.description}</p>

                <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                  <Button asChild variant="outline" size="sm">
                    <a href={resource.file_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <a href={resource.file_url} download aria-label={`Download ${resource.title}`}>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <span className="ml-auto text-[11px] text-dim">
                    {formatDate(resource.created_at)}
                  </span>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${resource.title}`}
                      className="text-bad hover:bg-bad/10"
                      onClick={() => onDelete(resource)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Panel>
          </li>
        );
      })}
    </ul>
  );
}
