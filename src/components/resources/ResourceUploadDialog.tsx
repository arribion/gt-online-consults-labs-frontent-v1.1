import { useRef, useState, type FormEvent } from "react";
import { FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormGrid, Modal, SelectField, TextField, TextareaField } from "@/components/common";
import { useMutation } from "@/hooks/useAsync";
import { resourcesService } from "@/services";
import type { SelectOption } from "@/types";

/**
 * Upload a project resource.
 *
 * The file type (image/video/raw) is decided server-side from the mime type —
 * nothing here needs to declare it, and guessing it client-side would only give
 * the two places a chance to disagree.
 */
export function ResourceUploadDialog({
  open,
  onOpenChange,
  projectOptions,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectOptions: SelectOption[];
  onUploaded: () => void;
}) {
  const [projectID, setProjectID] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setProjectID("");
    setTitle("");
    setDescription("");
    setVersion("1.0");
    setFile(null);
    setProgress(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const { mutate: upload, pending } = useMutation(
    () =>
      resourcesService.upload(
        { file: file!, projectID, title: title.trim(), description: description.trim(), version },
        setProgress,
      ),
    {
      success: "Resource uploaded.",
      onDone: () => {
        reset();
        onUploaded();
        onOpenChange(false);
      },
    },
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectID) return setError("Choose the project this belongs to.");
    if (!file) return setError("Pick a file to upload.");
    if (!title.trim()) return setError("Give the resource a title.");
    if (!description.trim()) return setError("Add a short description.");
    if (!version.trim()) return setError("Set a version.");
    setError("");
    await upload();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="Upload a resource"
      description="Taskers assigned to the project can view and download it."
    >
      <form id="resource-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}

        <SelectField
          label="Project"
          required
          value={projectID}
          onChange={(event) => setProjectID(event.target.value)}
          options={projectOptions}
          placeholder="Choose a project…"
        />

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-mist">
            File<span className="ml-0.5 text-bad">*</span>
          </span>
          <div className="rounded-xl border-2 border-dashed border-line2/70 bg-ink2/40 p-5 text-center">
            <input
              ref={inputRef}
              id="resource-file"
              type="file"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileUp className="h-5 w-5 shrink-0 text-sky2" />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-frost">{file.name}</p>
                  <p className="text-xs text-dim">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-panel2 hover:text-frost"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="resource-file"
                className="cursor-pointer text-sm text-mist underline-offset-4 hover:text-sky2 hover:underline"
              >
                Choose a file — images, video or documents
              </label>
            )}
          </div>
        </div>

        <FormGrid>
          <TextField
            label="Title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Annotation guidelines"
          />
          <TextField
            label="Version"
            required
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            placeholder="1.0"
          />
        </FormGrid>

        <TextareaField
          label="Description"
          required
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this is and when to use it."
        />

        {pending && progress > 0 && (
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-azure transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </form>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" form="resource-form" disabled={pending}>
          {pending ? `Uploading… ${progress}%` : "Upload resource"}
        </Button>
      </div>
    </Modal>
  );
}
