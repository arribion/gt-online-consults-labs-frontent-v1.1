import { AlertTriangle, Check, Clock, Gavel, HandCoins, Undo2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { formatDate, formatRelative } from "@/lib/format";
import {
  disputeActionFor,
  disputeCountdown,
  disputeProgress,
  disputeUrgency,
  otherClaimants,
  type Dispute,
} from "@/types";

const URGENCY_CLASS = {
  expired: "text-bad",
  urgent: "text-bad",
  soon: "text-warn",
  calm: "text-mist",
} as const;

/**
 * One contested task, from the point of view of a claimant.
 *
 * There is only ever one thing this person can do — step back, or take that
 * back — however many other claimants there are. That is what makes a
 * three-way no harder to read than a two-way: nobody is confirming *to*
 * anyone, so there is no matrix of who agreed with whom, just a list of who is
 * still claiming it and a count.
 *
 * The deadline is the loudest thing on the card because it decides the outcome
 * on its own: if more than one person is still standing when it passes, nobody
 * is paid. It comes from the server so it cannot drift with a wrong device
 * clock.
 */
export function DisputeCard({
  dispute,
  projectName,
  onWithdraw,
  onRevoke,
  pending,
}: {
  dispute: Dispute;
  projectName: string;
  onWithdraw: (dispute: Dispute) => void;
  onRevoke: (dispute: Dispute) => void;
  pending?: boolean;
}) {
  const action = disputeActionFor(dispute);
  const others = otherClaimants(dispute);
  const urgency = disputeUrgency(dispute);
  const highlight = dispute.status === "PENDING" && (urgency === "urgent" || urgency === "expired");
  const youWon = dispute.status === "RESOLVED" && dispute.claimants.some((c) => c.is_you && !c.withdrawn);

  return (
    <li
      className={`rounded-2xl border p-4 shadow-card ${
        highlight ? "border-bad/50 bg-bad/[0.06]" : "border-line/80 bg-card"
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

      <div className="mt-3 space-y-1.5 rounded-xl border border-line bg-ink2/50 p-2.5">
        <p className="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-dim">
          <Users className="h-3 w-3" />
          {others.length === 1 ? "Also logged by" : `${dispute.claimants.length} people logged this`}
        </p>
        {others.map((claimant) => (
          <div key={claimant.id} className="flex items-center gap-2.5">
            <UserAvatar name={claimant.full_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-frost">{claimant.full_name}</p>
              {claimant.email && <p className="truncate text-[11px] text-dim">{claimant.email}</p>}
            </div>
            {claimant.withdrawn ? (
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-good">
                <Check className="h-3 w-3" /> stepped back
              </span>
            ) : (
              <span className="shrink-0 text-[11px] text-mist">still claiming</span>
            )}
          </div>
        ))}
        {dispute.claimants.length > 2 && (
          <p className="px-0.5 pt-0.5 text-[11px] text-mist">{disputeProgress(dispute)}</p>
        )}
      </div>

      {dispute.status === "PENDING" && (
        <p
          className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${URGENCY_CLASS[urgency]}`}
        >
          <Clock className="h-3.5 w-3.5" />
          {dispute.hours_remaining > 0
            ? `${disputeCountdown(dispute)} — if more than one of you is still claiming it by then, nobody is paid`
            : "The window has closed — nobody is paid for this task"}
          {dispute.extended && <span className="font-normal text-dim">(extended by an admin)</span>}
        </p>
      )}

      <div className="mt-3 space-y-3">
        {action === "withdraw" && (
          <>
            <p className="text-sm text-mist">
              {dispute.standing_count > 2
                ? "If this task isn't yours, step back. It goes to whoever is left once everyone else has."
                : `If this task isn't yours, step back and it goes to ${
                    others[0]?.full_name ?? "the other claimant"
                  }.`}{" "}
              You can take that back while the window is open.
            </p>
            {dispute.involves_billed_work && (
              <p className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">
                This task has already been paid on an invoice. Stepping back means the amount is
                recovered from your next invoice — an admin has to approve that first, and you'll
                see it before it applies.
              </p>
            )}
            <Button size="sm" variant="outline" disabled={pending} onClick={() => onWithdraw(dispute)}>
              <HandCoins className="h-3.5 w-3.5" /> Step back from this task
            </Button>
          </>
        )}

        {action === "revoke" && (
          <>
            <p className="rounded-lg border border-line bg-ink2/50 px-3 py-2.5 text-sm text-mist">
              You stepped back from this task. If that was a mistake, taking it back reopens the
              dispute — {disputeCountdown(dispute)}.
            </p>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => onRevoke(dispute)}>
              <Undo2 className="h-3.5 w-3.5" /> Claim it again
            </Button>
          </>
        )}

        {action === "waiting" && (
          <p className="rounded-lg border border-line bg-ink2/50 px-3 py-2.5 text-sm text-mist">
            {dispute.can_revoke === false && dispute.can_withdraw === false
              ? "This task has already been billed, so it can't be changed here. Raise it with an admin."
              : `Waiting on ${
                  dispute.standing_count - 1 === 1 ? "the other claimant" : "the other claimants"
                }.`}
          </p>
        )}

        {action === "none" && dispute.status !== "PENDING" && (
          <p className="flex items-start gap-1.5 text-sm text-mist">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dim" />
            {dispute.status === "RESOLVED"
              ? `${youWon ? "Yours" : `Went to ${dispute.resolved_owner?.full_name ?? "another claimant"}`} on ${formatDate(dispute.resolved_at)}.`
              : `Forfeited on ${formatDate(dispute.forfeited_at)} — nobody is paid for this task.`}
          </p>
        )}

        {dispute.adjudicated_at && (
          <p className="flex items-start gap-1.5 rounded-lg border border-line bg-ink2/50 px-3 py-2.5 text-xs text-mist">
            <Gavel className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dim" />
            <span>
              Ruled on by {dispute.adjudicated_by?.full_name ?? "an administrator"}{" "}
              {formatRelative(dispute.adjudicated_at)}. {dispute.adjudication_reason}
            </span>
          </p>
        )}
      </div>

      <p className="mt-3 text-[11px] text-dim">Raised {formatDate(dispute.raised_at)}</p>
    </li>
  );
}
