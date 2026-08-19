import { AlertTriangle, Clock, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, UserAvatar } from "@/components/common";
import { formatDate, formatRelative } from "@/lib/format";
import { disputeActionFor, disputeDaysRemaining, type Dispute } from "@/types";

/**
 * One dispute, from the point of view of a tasker who is party to it.
 *
 * The deadline is the whole story: nothing notifies either party, and if the
 * five days run out both of them lose the task. So the countdown is the loudest
 * thing on the card, and the action button says which of claim/confirm is
 * actually available to this person right now.
 */
export function DisputeCard({
  dispute,
  currentUserId,
  projectName,
  onClaim,
  onConfirm,
  pending,
}: {
  dispute: Dispute;
  currentUserId: string | null;
  projectName: string;
  onClaim: (dispute: Dispute) => void;
  onConfirm: (dispute: Dispute) => void;
  pending?: boolean;
}) {
  const action = disputeActionFor(dispute, currentUserId);
  const other = dispute.user_1.id === currentUserId ? dispute.user_2 : dispute.user_1;
  const daysLeft = disputeDaysRemaining(dispute.raised_at);
  const urgent = dispute.status === "PENDING" && daysLeft <= 2;

  return (
    <li
      className={`rounded-2xl border p-4 shadow-card ${
        urgent ? "border-bad/50 bg-bad/[0.06]" : "border-line/80 bg-card"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-dim">
            {projectName}
          </p>
          <p className="mt-1 break-all font-mono text-sm text-frost">{dispute.task_id}</p>
        </div>
        <StatusBadge status={dispute.status} />
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-line bg-ink2/50 px-3 py-2.5">
        <UserAvatar name={other.full_name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-frost">{other.full_name}</p>
          <p className="text-xs text-mist">also logged this task</p>
        </div>
      </div>

      {dispute.status === "PENDING" ? (
        <div className="mt-3 space-y-3">
          <p
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              urgent ? "text-bad" : "text-warn"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {daysLeft > 0
              ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left — both of you forfeit this task if nobody acts`
              : "The window has closed — this forfeits for both of you"}
          </p>

          {action === "claim" && (
            <>
              <p className="text-sm text-mist">
                If this task is yours, claim it. {other.full_name} then has to confirm before it
                transfers.
              </p>
              <Button size="sm" disabled={pending} onClick={() => onClaim(dispute)}>
                <Handshake className="h-3.5 w-3.5" /> Claim this task
              </Button>
            </>
          )}

          {action === "waiting" && (
            <p className="rounded-lg border border-line bg-ink2/50 px-3 py-2.5 text-sm text-mist">
              You claimed this {formatRelative(dispute.claimed_at)}. It resolves once{" "}
              {other.full_name} confirms — you can't confirm your own claim.
            </p>
          )}

          {action === "confirm" && (
            <>
              <p className="text-sm text-mist">
                {other.full_name} claimed this task {formatRelative(dispute.claimed_at)}. Confirming
                transfers it to them and forfeits your entry. If you disagree, leave it and raise it
                with an administrator instead.
              </p>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => onConfirm(dispute)}
              >
                Confirm transfer to {other.full_name.split(" ")[0]}
              </Button>
            </>
          )}
        </div>
      ) : (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-mist">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dim" />
          {dispute.status === "RESOLVED"
            ? `Awarded to ${dispute.resolved_owner?.full_name ?? "the claimant"} on ${formatDate(
                dispute.resolved_at,
              )}.`
            : `Forfeited on ${formatDate(dispute.forfeited_at)} — neither party is paid for this task.`}
        </p>
      )}

      <p className="mt-3 text-[11px] text-dim">Raised {formatDate(dispute.raised_at)}</p>
    </li>
  );
}
