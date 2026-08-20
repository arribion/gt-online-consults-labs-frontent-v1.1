import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormGrid, Modal, SelectField, TextField, TextareaField } from "@/components/common";
import { useMutation } from "@/hooks/useAsync";
import { projectsService } from "@/services";
import { PROJECT_STATUSES, type Project, type ProjectCreate } from "@/types";

const STATUS_OPTIONS = PROJECT_STATUSES.filter((status) => status !== "DEACTIVATED").map(
  (value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }),
);

const EMPTY: ProjectCreate = {
  project_name: "",
  platform: "",
  avg_pay: 0,
  description: "",
  status: "ACTIVE",
  category: "",
  revenue_split: { tasker: 0, admin: 0, owner: 0 },
};

/**
 * Create or edit a project.
 *
 * `DEACTIVATED` isn't offered as a status: it's the outcome of the deactivate
 * action (which also purges the project's files), not something to set by hand.
 */
export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create. */
  project?: Project | null;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<ProjectCreate>(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setValues(
      project
        ? {
            project_name: project.project_name,
            platform: project.platform,
            avg_pay: project.avg_pay,
            description: project.description,
            status: project.status,
            category: project.category ?? "",
            revenue_split: project.revenue_split ?? { tasker: 0, admin: 0, owner: 0 },
          }
        : EMPTY,
    );
  }, [open, project]);

  const { mutate: save, pending } = useMutation(
    () => (project ? projectsService.update(project.id, values) : projectsService.create(values)),
    {
      success: project ? "Project updated." : "Project created.",
      onDone: () => {
        onSaved();
        onOpenChange(false);
      },
    },
  );

  const set = <K extends keyof ProjectCreate>(key: K, value: ProjectCreate[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const setSplit = (key: "tasker" | "admin" | "owner", value: number) =>
    setValues((current) => ({
      ...current,
      revenue_split: { ...(current.revenue_split ?? EMPTY.revenue_split!), [key]: value },
    }));

  const split = values.revenue_split ?? EMPTY.revenue_split!;
  const splitTotal = split.tasker + split.admin + split.owner;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.project_name.trim()) return setError("Give the project a name.");
    if (!values.platform.trim()) return setError("Name the platform this work comes from.");
    if (!values.description.trim()) return setError("Add a short description.");
    if (values.avg_pay <= 0) return setError("The default rate has to be greater than zero.");
    setError("");
    await save();
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={project ? "Edit project" : "New project"}
      description="The default rate here is what invoices bill at unless an admin overrides it at generation time."
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}

        <FormGrid>
          <TextField
            label="Project name"
            required
            value={values.project_name}
            onChange={(event) => set("project_name", event.target.value)}
            placeholder="Handshake annotation"
            hint="Must be unique."
          />
          <TextField
            label="Platform"
            required
            value={values.platform}
            onChange={(event) => set("platform", event.target.value)}
            placeholder="Handshake"
          />
          <TextField
            label="Default rate ($/hr)"
            type="number"
            required
            min={0}
            step="0.01"
            value={values.avg_pay || ""}
            onChange={(event) => set("avg_pay", Number(event.target.value))}
          />
          <SelectField
            label="Status"
            required
            value={values.status}
            onChange={(event) => set("status", event.target.value as Project["status"])}
            options={STATUS_OPTIONS}
          />
          <TextField
            label="Category"
            value={values.category ?? ""}
            onChange={(event) => set("category", event.target.value)}
            placeholder="Data annotation"
            wrapperClassName="sm:col-span-2"
          />
        </FormGrid>

        <TextareaField
          label="Description"
          required
          rows={3}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          placeholder="What the work involves — taskers see this on their project card."
        />

        <fieldset className="rounded-xl border border-line bg-ink2/40 p-3.5">
          <legend className="px-1 text-xs font-semibold text-mist">Revenue split (%)</legend>
          <div className="grid grid-cols-3 gap-3">
            {(["tasker", "admin", "owner"] as const).map((party) => (
              <TextField
                key={party}
                label={party.charAt(0).toUpperCase() + party.slice(1)}
                type="number"
                min={0}
                max={100}
                value={split[party] || ""}
                onChange={(event) => setSplit(party, Number(event.target.value))}
              />
            ))}
          </div>
          {splitTotal > 0 && splitTotal !== 100 && (
            <p className="mt-2 text-xs text-warn">
              These add up to {splitTotal}%, not 100% — saving anyway is allowed, but worth a check.
            </p>
          )}
        </fieldset>
      </form>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" form="project-form" disabled={pending}>
          {pending ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
      </div>
    </Modal>
  );
}
