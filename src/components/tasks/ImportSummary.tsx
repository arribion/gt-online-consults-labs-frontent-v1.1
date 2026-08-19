import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DISPUTE_RESOLUTION_DAYS, type TaskImportSummary } from "@/types";

/**
 * What the server did with an upload.
 *
 * A successful upload has exactly two outcomes now: rows that landed, and task
 * IDs that collided with *another* tasker and are therefore contested. There is
 * no third "duplicates skipped" case — repeating a task you already logged
 * rejects the whole upload, so it never reaches this component.
 *
 * The contested list gets the emphasis because this response is the only moment
 * a tasker is told who they collided with, and it names every claimant rather
 * than just the first.
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

      {summary.disputes_raised.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-bad/40 bg-bad/10 p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-frost">
              {summary.disputes_raised.length} task
              {summary.disputes_raised.length === 1 ? "" : "s"} contested
            </p>
            <p className="mt-0.5 text-sm text-mist">
              Someone else already logged these task IDs on this project. Every contested entry is
              held back from invoicing until it settles: the task goes to whoever is still claiming
              it once everyone else has stepped back, and if more than one of you is still claiming
              it after {DISPUTE_RESOLUTION_DAYS} days, nobody is paid for it.
            </p>
            <ul className="mt-2 space-y-1">
              {summary.disputes_raised.map((dispute) => (
                <li key={dispute.task_id} className="text-xs text-frost/90">
                  <span className="font-mono text-dim">{dispute.task_id}</span> — also logged by{" "}
                  <span className="font-semibold">
                    {(dispute.all_parties.length ? dispute.all_parties : [dispute.disputed_with])
                      .map((party) => party.full_name)
                      .join(", ")}
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link to={disputesPath}>Settle these</Link>
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
