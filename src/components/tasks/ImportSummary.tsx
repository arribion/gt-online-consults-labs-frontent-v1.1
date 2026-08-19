import { AlertTriangle, CheckCircle2, CopyX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { TaskImportSummary } from "@/types";

/**
 * What the server did with an upload.
 *
 * The three outcomes are deliberately separated: rows that landed, rows skipped
 * as duplicates of the tasker's own earlier upload, and task IDs that collided
 * with *another* tasker and became disputes. The last one is the only one that
 * needs action, and it names the other party — so it gets the emphasis.
 */
export function ImportSummary({
  summary,
  disputesPath = "/client/disputes",
  onDismiss,
}: {
  summary: TaskImportSummary;
  disputesPath?: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-xl border border-good/40 bg-good/10 p-3.5">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-frost">
            {summary.rows_created} {summary.rows_created === 1 ? "task" : "tasks"} recorded
          </p>
          <p className="mt-0.5 text-sm text-mist">{summary.message}</p>
        </div>
      </div>

      {summary.duplicates_skipped > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-warn/40 bg-warn/10 p-3.5">
          <CopyX className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-frost">
              {summary.duplicates_skipped} duplicate{summary.duplicates_skipped === 1 ? "" : "s"}{" "}
              skipped
            </p>
            <p className="mt-0.5 text-sm text-mist">
              You'd already logged these task IDs on this project, so only the first copy of each is
              on record.
            </p>
            {summary.duplicate_task_ids.length > 0 && (
              <p className="mt-2 break-all font-mono text-[11px] text-dim">
                {summary.duplicate_task_ids.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      {summary.disputes_raised.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-bad/40 bg-bad/10 p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-frost">
              {summary.disputes_raised.length} task
              {summary.disputes_raised.length === 1 ? "" : "s"} disputed
            </p>
            <p className="mt-0.5 text-sm text-mist">
              Another tasker already logged these task IDs on this project. Both entries are held
              back from invoicing until the dispute is settled — and it forfeits for both of you if
              nobody acts within 5 days.
            </p>
            <ul className="mt-2 space-y-1">
              {summary.disputes_raised.map((dispute) => (
                <li key={dispute.task_id} className="text-xs text-frost/90">
                  <span className="font-mono text-dim">{dispute.task_id}</span> — also submitted by{" "}
                  <span className="font-semibold">{dispute.disputed_with.full_name}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link to={disputesPath}>Review disputes</Link>
            </Button>
          </div>
        </div>
      )}

      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss} className="text-mist">
          Log more tasks
        </Button>
      )}
    </div>
  );
}
