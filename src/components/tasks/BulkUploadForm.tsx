import { useRef, useState } from "react";
import { AlertTriangle, Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, SelectField } from "@/components/common";
import { downloadTaskTemplate, parseTaskFile, type ParsedFile } from "@/lib/taskFile";
import { formatMinutes } from "@/lib/format";
import { REQUIRED_TASK_HEADERS, type SelectOption, type TaskImportSummary } from "@/types";
import { tasksService } from "@/services";
import { useMutation } from "@/hooks/useAsync";

/**
 * Bulk task upload.
 *
 * The file is parsed and checked in the browser first, because the server
 * rejects a file whole if a single row is malformed — showing every problem at
 * once here means one fix pass instead of one upload per mistake.
 */
export function BulkUploadForm({
  projectOptions,
  onUploaded,
}: {
  projectOptions: SelectOption[];
  onUploaded: (summary: TaskImportSummary) => void;
}) {
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: upload, pending } = useMutation(
    (selectedFile: File, selectedProject: string) =>
      tasksService.import(selectedFile, selectedProject, setProgress),
    { onDone: onUploaded },
  );

  const takeFile = async (next: File) => {
    setFile(next);
    setParsed(null);
    setParseError("");
    setParsing(true);
    try {
      setParsed(await parseTaskFile(next));
    } catch {
      setParseError("Couldn't read that file. Save it as .xlsx or .csv and try again.");
    } finally {
      setParsing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsed(null);
    setParseError("");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const blocked =
    !file ||
    !projectId ||
    !parsed ||
    parsed.missingHeaders.length > 0 ||
    parsed.errorCount > 0 ||
    !parsed.rows.length;

  return (
    <Panel className="space-y-4">
      <PanelHeader
        title="Upload a task log"
        description="A .csv or .xlsx export with one row per completed task."
        action={
          <Button variant="outline" size="sm" onClick={() => void downloadTaskTemplate()}>
            <Download className="h-3.5 w-3.5" /> Template
          </Button>
        }
      />

      <SelectField
        label="Project"
        required
        value={projectId}
        onChange={(event) => setProjectId(event.target.value)}
        options={projectOptions}
        placeholder={projectOptions.length ? "Choose a project…" : "No projects assigned to you"}
        disabled={!projectOptions.length}
        hint="You can only upload against projects you're actively assigned to."
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) void takeFile(dropped);
        }}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? "border-azure bg-azure/5" : "border-line2/70 bg-ink2/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="sr-only"
          id="task-file"
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            if (chosen) void takeFile(chosen);
          }}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-sky2" />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-frost">{file.name}</p>
              <p className="text-xs text-dim">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label="Remove file"
              className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-panel2 hover:text-frost"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-6 w-6 text-dim" />
            <p className="mt-2 text-sm text-mist">
              Drag a file here, or{" "}
              <label
                htmlFor="task-file"
                className="cursor-pointer font-semibold text-sky2 underline-offset-4 hover:underline"
              >
                browse
              </label>
            </p>
            <p className="mt-1 text-xs text-dim">
              Required columns: {REQUIRED_TASK_HEADERS.join(", ")}
            </p>
          </>
        )}
      </div>

      {parsing && <p className="text-sm text-mist">Checking the file…</p>}
      {parseError && <p className="text-sm text-bad">{parseError}</p>}

      {parsed && parsed.missingHeaders.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-bad/40 bg-bad/10 p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          <div>
            <p className="text-sm font-semibold text-frost">Missing required column(s)</p>
            <p className="mt-0.5 text-sm text-mist">
              Add {parsed.missingHeaders.join(", ")} to the header row. The server rejects the whole
              file until every required column is present.
            </p>
          </div>
        </div>
      )}

      {parsed && !parsed.missingHeaders.length && (
        <ParsePreview parsed={parsed} />
      )}

      {pending && progress > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-azure transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <Button
        className="w-full sm:w-auto"
        disabled={blocked || pending}
        onClick={() => file && upload(file, projectId)}
      >
        <Upload className="h-4 w-4" />
        {pending ? "Uploading…" : `Upload ${parsed?.rows.length ?? 0} rows`}
      </Button>
    </Panel>
  );
}

function ParsePreview({ parsed }: { parsed: ParsedFile }) {
  const bad = parsed.rows.filter((row) => row.errors.length);

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "Rows", value: parsed.rows.length.toString() },
          { label: "Completed", value: parsed.completedCount.toString() },
          { label: "Billable", value: formatMinutes(parsed.billableMinutes) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-ink2/50 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-dim">
              {stat.label}
            </dt>
            <dd className="mt-1 font-display text-lg font-bold tabular-nums text-frost">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {bad.length > 0 ? (
        <div className="rounded-xl border border-bad/40 bg-bad/10 p-3.5">
          <p className="text-sm font-semibold text-frost">
            {bad.length} row{bad.length === 1 ? "" : "s"} need fixing before this can upload
          </p>
          <ul className="mt-2 max-h-52 space-y-1.5 overflow-y-auto pr-1">
            {bad.slice(0, 25).map((row) => (
              <li key={row.rowNumber} className="text-xs text-mist">
                <span className="font-semibold text-frost">Row {row.rowNumber}:</span>{" "}
                {row.errors.join("; ")}
              </li>
            ))}
            {bad.length > 25 && (
              <li className="text-xs text-dim">…and {bad.length - 25} more</li>
            )}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-good">
          Every row parses. Billable minutes are capped per row — that's what the invoice will use.
        </p>
      )}
    </div>
  );
}
