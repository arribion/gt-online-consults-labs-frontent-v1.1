import { useState, type FormEvent } from "react";
import { Gavel, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, SelectField, TextField } from "@/components/common";
import { useMutation } from "@/hooks/useAsync";
import { disputesService } from "@/services";
import { formatDate } from "@/lib/format";
import type { Dispute } from "@/types";

/**
 * Give the claimants more time.
 *
 * The only thing an admin may do while a dispute is live, because it is the
 * only thing that decides nothing. Someone on leave when their task was
 * contested should not lose it to the calendar.
 */
export function ExtendDisputeDialog({
  dispute,
  onClose,
  onDone,
}: {
  dispute: Dispute | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [days, setDays] = useState("5");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const { mutate: extend, pending } = useMutation(
    () => disputesService.extend(dispute!.id, { days: Number(days), reason: reason.trim() }),
    {
      success: "Deadline extended — every claimant has been told.",
      onDone: () => {
        onDone();
        onClose();
      },
    },
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (reason.trim().length < 3) return setError("Say why — the claimants see this.");
    setError("");
    await extend();
  };

  return (
    <Modal
      open={!!dispute}
      onOpenChange={(next) => !next && onClose()}
      title="Give them more time"
      description="Extending decides nothing — it only moves the deadline. Everyone claiming the task is notified, with your reason."
    >
      <form id="extend-dispute" onSubmit={submit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}
        {dispute && (
          <p className="rounded-lg border border-line bg-ink2/40 px-3 py-2.5 text-sm text-mist">
            <span className="font-mono text-frost">{dispute.task_id}</span> currently expires{" "}
            {formatDate(dispute.expires_at)}.
          </p>
        )}
        <SelectField
          label="Extend by"
          value={days}
          onChange={(event) => setDays(event.target.value)}
          options={[2, 3, 5, 7, 14].map((n) => ({ value: String(n), label: `${n} days` }))}
        />
        <TextField
          label="Reason"
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. One claimant is on leave until Friday"
          hint="Shown to every claimant."
        />
      </form>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" form="extend-dispute" disabled={pending}>
          <Timer className="h-4 w-4" /> {pending ? "Extending…" : "Extend deadline"}
        </Button>
      </div>
    </Modal>
  );
}

/**
 * Rule on a dispute that expired without agreement.
 *
 * Superadmin only, and only after the window has closed. Before that the
 * claimants own the outcome — an administrator picking a winner early would be
 * exactly the unilateral call the whole handshake exists to avoid. This is
 * recovery on a dead dispute: without it, a claimant who left the company or a
 * typo'd task ID becomes a permanent loss with no recourse but the database.
 */
export function AdjudicateDisputeDialog({
  dispute,
  onClose,
  onDone,
}: {
  dispute: Dispute | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [awardTo, setAwardTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const { mutate: rule, pending } = useMutation(
    () =>
      disputesService.adjudicate(dispute!.id, {
        award_to_user_id: awardTo || null,
        reason: reason.trim(),
      }),
    {
      success: "Ruling recorded — every claimant has been told.",
      onDone: () => {
        onDone();
        onClose();
      },
    },
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (reason.trim().length < 3) return setError("A reason is required — the claimants see it.");
    setError("");
    await rule();
  };

  return (
    <Modal
      open={!!dispute}
      onOpenChange={(next) => !next && onClose()}
      title="Rule on this expired dispute"
      description="The claimants had their window and didn't settle it. You can award the task to one of them, or leave it unpaid."
    >
      <form id="adjudicate-dispute" onSubmit={submit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}

        {dispute && (
          <div className="rounded-lg border border-line bg-ink2/40 px-3 py-2.5 text-sm text-mist">
            <p className="font-mono text-frost">{dispute.task_id}</p>
            <p className="mt-1">
              Raised {formatDate(dispute.raised_at)}, forfeited {formatDate(dispute.forfeited_at)}.{" "}
              {dispute.claimants.length} claimant(s):{" "}
              {dispute.claimants.map((c) => c.full_name).join(", ")}.
            </p>
            {dispute.involves_billed_work && (
              <p className="mt-1.5 text-warn">
                One of these entries was already paid. Awarding it elsewhere queues an adjustment
                against the previous holder's next invoice.
              </p>
            )}
          </div>
        )}

        <SelectField
          label="Award the task to"
          value={awardTo}
          onChange={(event) => setAwardTo(event.target.value)}
          options={(dispute?.claimants ?? []).map((claimant) => ({
            value: claimant.id,
            label: claimant.full_name + (claimant.withdrawn ? " (stepped back)" : ""),
          }))}
          placeholder="Nobody — leave it unpaid"
          hint="Leaving it unpaid is a decision too, and is recorded as one."
        />
        <TextField
          label="Reason"
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Confirmed against the platform export"
          hint="Shown to every claimant, and kept on the record."
        />
      </form>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" form="adjudicate-dispute" disabled={pending}>
          <Gavel className="h-4 w-4" /> {pending ? "Recording…" : "Record ruling"}
        </Button>
      </div>
    </Modal>
  );
}
