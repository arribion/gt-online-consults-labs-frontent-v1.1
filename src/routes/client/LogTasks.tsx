import { useState } from "react";
import { Info } from "lucide-react";
import { PageHeader, Panel, SegmentedFilter } from "@/components/common";
import { BulkUploadForm } from "@/components/tasks/BulkUploadForm";
import { SingleTaskForm } from "@/components/tasks/SingleTaskForm";
import { ImportSummary } from "@/components/tasks/ImportSummary";
import { useMyProjects } from "@/hooks/useLookups";
import type { TaskImportSummary } from "@/types";

const MODES = [
  { value: "bulk", label: "Bulk upload" },
  { value: "single", label: "One task" },
];

export default function LogTasks() {
  const { uploadable, loading } = useMyProjects();
  const [mode, setMode] = useState("bulk");
  const [summary, setSummary] = useState<TaskImportSummary | null>(null);

  const options = uploadable
    .filter((row) => row.project)
    .map((row) => ({ value: row.project!.id, label: row.project!.project_name }));

  return (
    <>
      <PageHeader
        eyebrow="Task log"
        title="Log completed tasks"
        description="Bulk upload is the encouraged path. Either way the billable minutes are computed for you — a row can declare a cap, never a payout."
      />

      {summary ? (
        <Panel>
          <ImportSummary summary={summary} onDismiss={() => setSummary(null)} />
        </Panel>
      ) : (
        <>
          <SegmentedFilter
            ariaLabel="How to log tasks"
            value={mode}
            onChange={setMode}
            options={MODES}
          />

          {!loading && !options.length && (
            <Panel className="flex items-start gap-3 border-warn/40 bg-warn/10">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
              <p className="text-sm text-mist">
                You aren't assigned to any project that accepts task logs right now. An administrator
                needs to assign you before you can upload.
              </p>
            </Panel>
          )}

          {mode === "bulk" ? (
            <BulkUploadForm projectOptions={options} onUploaded={setSummary} />
          ) : (
            <SingleTaskForm projectOptions={options} onCreated={setSummary} />
          )}

          <Panel className="border-line/60 bg-ink2/40">
            <h2 className="font-display text-sm font-semibold text-frost">How rows are read</h2>
            <ul className="mt-3 space-y-2 text-sm text-mist">
              <li>
                <span className="font-semibold text-frost">Billable minutes</span> = the lesser of
                your task duration rounded up to a whole minute, and the cap in PAID DURATION.
              </li>
              <li>
                <span className="font-semibold text-frost">Only Completed rows</span> reach an
                invoice. Other statuses are stored for the record and left out of the totals.
              </li>
              <li>
                <span className="font-semibold text-frost">Re-uploading your own task ID</span> on
                the same project is skipped as a duplicate — only the first copy counts.
              </li>
              <li>
                <span className="font-semibold text-frost">A task ID someone else logged</span> on
                the same project raises a dispute. Both entries are withheld from invoicing until
                it's settled, and both forfeit if nobody acts within 5 days.
              </li>
            </ul>
          </Panel>
        </>
      )}
    </>
  );
}
