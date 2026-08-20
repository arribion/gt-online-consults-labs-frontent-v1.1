import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import {
  AsyncSection,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SearchInput,
  SelectFilter,
} from "@/components/common";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { useAsync } from "@/hooks/useAsync";
import { useMyProjects } from "@/hooks/useLookups";
import { resourcesService } from "@/services";
import { RESOURCE_TYPES, type Resource } from "@/types";

const TYPE_OPTIONS = RESOURCE_TYPES.map((value) => ({
  value,
  label: value === "raw" ? "Document" : value.charAt(0).toUpperCase() + value.slice(1),
}));

export default function Resources() {
  const { options: projectOptions, nameById } = useMyProjects();
  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  // The server already scopes a tasker to their assigned projects, so an
  // unfiltered call returns exactly the right set.
  const { data, loading, error, refetch } = useAsync<Resource[]>(
    () => resourcesService.list(projectId || undefined),
    [projectId],
    [],
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

  const activeFilters = [projectId, type, search].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Project resources"
        description="Guides, references and files for the projects you're assigned to."
      />

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
            allLabel="All my projects"
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
              title={data.length ? "Nothing matches these filters" : "No resources yet"}
              description={
                data.length
                  ? "Try a different project or file type."
                  : "Once an administrator uploads material for your projects, it appears here."
              }
            />
          </Panel>
        }
      >
        <ResourceGrid
          resources={rows}
          projectName={(id) => nameById.get(id) ?? "Project"}
        />
      </AsyncSection>
    </>
  );
}
