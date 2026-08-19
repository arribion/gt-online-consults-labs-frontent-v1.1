import { useMemo, useState } from "react";
import { BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  ConfirmDialog,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SearchInput,
  SelectFilter,
  StatCard,
  StatGrid,
} from "@/components/common";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { ResourceUploadDialog } from "@/components/resources/ResourceUploadDialog";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useAllProjects } from "@/hooks/useLookups";
import { resourcesService } from "@/services";
import { RESOURCE_TYPES, type Resource } from "@/types";

const TYPE_OPTIONS = RESOURCE_TYPES.map((value) => ({
  value,
  label: value === "raw" ? "Document" : value.charAt(0).toUpperCase() + value.slice(1),
}));

export default function AdminResources() {
  const { options: projectOptions, nameById } = useAllProjects();

  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<Resource | null>(null);

  const { data, loading, error, refetch } = useAsync<Resource[]>(
    () => resourcesService.list(projectId || undefined),
    [projectId],
    [],
  );

  const { mutate: remove, pending: removing } = useMutation(
    (resource: Resource) => resourcesService.remove(resource.id),
    { success: "Resource deleted.", onDone: () => void refetch() },
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.filter((resource) => {
      if (type && resource.type !== type) return false;
      if (needle && !`${resource.title} ${resource.description}`.toLowerCase().includes(needle))
        return false;
      return true;
    });
  }, [data, type, search]);

  const byType = useMemo(
    () =>
      RESOURCE_TYPES.map((value) => ({
        type: value,
        count: data.filter((resource) => resource.type === value).length,
      })),
    [data],
  );

  const activeFilters = [projectId, type, search].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Billing & files"
        title="Resources"
        description="Guides and reference files, scoped to a project. Only taskers assigned to that project can see them."
        actions={
          <Button onClick={() => setUploading(true)} disabled={!projectOptions.length}>
            <Upload className="h-4 w-4" /> Upload resource
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard label="Resources" value={data.length} icon={BookOpen} />
        {byType.map((entry) => (
          <StatCard
            key={entry.type}
            label={entry.type === "raw" ? "Documents" : `${entry.type}s`}
            value={entry.count}
          />
        ))}
      </StatGrid>

      <Panel className="space-y-4">
        <FilterBar
          active={activeFilters}
          onReset={() => {
            setProjectId("");
            setType("");
            setSearch("");
          }}
        >
          <SearchInput value={search} onChange={setSearch} placeholder="Search resources…" />
          <SelectFilter
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
            allLabel="All projects"
          />
          <SelectFilter
            label="Type"
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
            allLabel="Any type"
          />
        </FilterBar>
      </Panel>

      <AsyncSection
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!rows.length}
        empty={
          <Panel>
            <EmptyState
              icon={BookOpen}
              title={data.length ? "Nothing matches these filters" : "No resources uploaded"}
              description={
                data.length
                  ? "Try a different project or file type."
                  : "Upload guidelines or reference material so taskers know what's expected."
              }
              action={
                <Button size="sm" onClick={() => setUploading(true)} disabled={!projectOptions.length}>
                  Upload the first resource
                </Button>
              }
            />
          </Panel>
        }
      >
        <ResourceGrid
          resources={rows}
          projectName={(id) => nameById.get(id) ?? "Project"}
          onDelete={setDeleting}
        />
      </AsyncSection>

      <ResourceUploadDialog
        open={uploading}
        onOpenChange={setUploading}
        projectOptions={projectOptions}
        onUploaded={refetch}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this resource?"
        confirmLabel="Delete resource"
        pending={removing}
        message={
          <>
            <span className="font-semibold text-frost">{deleting?.title}</span> is removed from
            Cloudinary and from the database. Anyone with the direct file link loses access too.
            This can't be undone.
          </>
        }
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting);
          setDeleting(null);
        }}
      />
    </>
  );
}
