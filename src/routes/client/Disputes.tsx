import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  AsyncSection,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Panel,
  SegmentedFilter,
} from "@/components/common";
import { DisputeCard } from "@/components/disputes/DisputeCard";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useMyProjects } from "@/hooks/useLookups";
import { useAuth } from "@/hooks/useAuth";
import { disputesService } from "@/services";
import { disputeActionFor, type Dispute } from "@/types";

const TABS = [
  { value: "open", label: "Needs action" },
  { value: "history", label: "History" },
];

export default function Disputes() {
  const { user } = useAuth();
  const { nameById } = useMyProjects();
  const [tab, setTab] = useState("open");
  const [confirming, setConfirming] = useState<Dispute | null>(null);
  const [revoking, setRevoking] = useState<Dispute | null>(null);

  const { data, loading, error, refetch } = useAsync<Dispute[]>(
    () => disputesService.mine(),
    [],
    [],
  );

  const { mutate: claim, pending: claiming } = useMutation(
    (dispute: Dispute) => disputesService.claim(dispute.id),
    { success: "Claim recorded — the other party has to confirm it.", onDone: () => void refetch() },
  );

  const { mutate: confirm, pending: confirmingPending } = useMutation(
    (dispute: Dispute) =>
      disputesService.confirm(dispute.id, {
        confirm_task_id: dispute.task_id,
        transfer_to_user_id: dispute.claimed_by!.id,
      }),
    { success: "Dispute resolved.", onDone: () => void refetch() },
  );

  const { mutate: revoke, pending: revokingPending } = useMutation(
    (dispute: Dispute) => disputesService.revoke(dispute.id),
    {
      success: "Transfer undone — the dispute is open again.",
      onDone: () => void refetch(),
    },
  );

  /**
   * "Needs action" is anything this person can still do something about — which
   * includes a resolved dispute they confirmed and could still undo, not just
   * pending ones.
   */
  const { open, history } = useMemo(() => {
    const actionable = (dispute: Dispute) =>
      dispute.status === "PENDING" || disputeActionFor(dispute, user?.id ?? null) === "revoke";
    return {
      open: data.filter(actionable),
      history: data.filter((dispute) => !actionable(dispute)),
    };
  }, [data, user?.id]);

  const visible = tab === "open" ? open : history;
  const projectName = (id: string) => nameById.get(id) ?? "Project";

  return (
    <>
      <PageHeader
        eyebrow="Disputes"
        title="Task disputes"
        description="Raised automatically when someone else logs a task ID you already logged on the same project. Nothing notifies either side — this page is how you find out."
      />

      <Panel className="border-line/60 bg-ink2/40">
        <p className="text-sm text-mist">
          <span className="font-semibold text-frost">How it settles:</span> one party claims the
          task, the other confirms, and the task transfers to the claimant. A confirmation can be
          undone by the person who gave it, as long as the window is still open and the task hasn't
          been invoiced. Five days after it was raised, an unresolved dispute forfeits —{" "}
          <span className="text-frost">both</span> entries drop out of invoicing permanently.
        </p>
      </Panel>

      <SegmentedFilter
        ariaLabel="Dispute view"
        value={tab}
        onChange={setTab}
        options={TABS.map((option) =>
          option.value === "open" && open.length
            ? { ...option, label: `${option.label} (${open.length})` }
            : option,
        )}
      />

      <AsyncSection
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!visible.length}
        empty={
          <Panel>
            <EmptyState
              icon={ShieldCheck}
              title={tab === "open" ? "Nothing needs your attention" : "No settled disputes yet"}
              description={
                tab === "open"
                  ? "No one has contested any of your logged tasks."
                  : "Resolved and forfeited disputes will be listed here."
              }
            />
          </Panel>
        }
      >
        <ul className="grid gap-3 lg:grid-cols-2">
          {visible.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              currentUserId={user?.id ?? null}
              projectName={projectName(dispute.project_id)}
              onClaim={claim}
              onConfirm={setConfirming}
              onRevoke={setRevoking}
              pending={claiming || confirmingPending || revokingPending}
            />
          ))}
        </ul>
      </AsyncSection>

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(next) => !next && setConfirming(null)}
        title="Confirm the transfer?"
        confirmLabel="Confirm transfer"
        pending={confirmingPending}
        message={
          confirming && (
            <>
              This gives task <span className="font-mono text-frost">{confirming.task_id}</span> to{" "}
              <span className="font-semibold text-frost">{confirming.claimed_by?.full_name}</span>{" "}
              and forfeits your own entry for it. You can undo this while the window is open and the
              task hasn't been invoiced.
            </>
          )
        }
        onConfirm={async () => {
          if (!confirming) return;
          await confirm(confirming);
          setConfirming(null);
        }}
      />

      <ConfirmDialog
        open={!!revoking}
        onOpenChange={(next) => !next && setRevoking(null)}
        title="Undo this transfer?"
        confirmLabel="Undo transfer"
        tone="default"
        pending={revokingPending}
        message={
          revoking && (
            <>
              Task <span className="font-mono text-frost">{revoking.task_id}</span> goes back to
              being disputed, and the claim on it is cleared — either you or{" "}
              <span className="font-semibold text-frost">
                {revoking.resolved_owner?.full_name}
              </span>{" "}
              can claim it again. The original 5-day deadline still applies, so if neither of you
              settles it in time you both forfeit the task.
            </>
          )
        }
        onConfirm={async () => {
          if (!revoking) return;
          await revoke(revoking);
          setRevoking(null);
        }}
      />
    </>
  );
}
