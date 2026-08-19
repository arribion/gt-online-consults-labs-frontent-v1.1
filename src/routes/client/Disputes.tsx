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
import { disputesService } from "@/services";
import { DISPUTE_RESOLUTION_DAYS, otherClaimants, type Dispute } from "@/types";

const TABS = [
  { value: "open", label: "Needs action" },
  { value: "history", label: "History" },
];

export default function Disputes() {
  const { nameById } = useMyProjects();
  const [tab, setTab] = useState("open");
  const [withdrawing, setWithdrawing] = useState<Dispute | null>(null);
  const [revoking, setRevoking] = useState<Dispute | null>(null);

  const { data, loading, error, refetch } = useAsync<Dispute[]>(
    () => disputesService.mine(),
    [],
    [],
  );

  const { mutate: withdraw, pending: withdrawPending } = useMutation(
    (dispute: Dispute) =>
      disputesService.withdraw(dispute.id, { confirm_task_id: dispute.task_id }),
    { success: "You've stepped back from this task.", onDone: () => void refetch() },
  );

  const { mutate: revoke, pending: revokePending } = useMutation(
    (dispute: Dispute) => disputesService.revoke(dispute.id),
    { success: "You're claiming this task again.", onDone: () => void refetch() },
  );

  /**
   * "Needs action" is anything this person can still change — which includes a
   * settled dispute they could still take back, not only pending ones.
   */
  const { open, history } = useMemo(() => {
    const actionable = (dispute: Dispute) =>
      dispute.status === "PENDING" || dispute.can_revoke;
    return {
      open: data.filter(actionable),
      history: data.filter((dispute) => !actionable(dispute)),
    };
  }, [data]);

  const visible = tab === "open" ? open : history;
  const projectName = (id: string) => nameById.get(id) ?? "Project";

  return (
    <>
      <PageHeader
        eyebrow="Disputes"
        title="Task disputes"
        description="Raised automatically when someone else logs a task ID you already logged on the same project."
      />

      <Panel className="border-line/60 bg-ink2/40">
        <p className="text-sm text-mist">
          <span className="font-semibold text-frost">How it settles:</span> everyone who logged the
          task is claiming it. The task goes to whoever is still claiming it once everyone else has
          stepped back — you can take your own step back at any point while the window is open.
          After {DISPUTE_RESOLUTION_DAYS} days, if more than one of you is still claiming it,{" "}
          <span className="text-frost">nobody</span> is paid for that task.
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
                  : "Settled and forfeited disputes will be listed here."
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
              projectName={projectName(dispute.project_id)}
              onWithdraw={setWithdrawing}
              onRevoke={setRevoking}
              pending={withdrawPending || revokePending}
            />
          ))}
        </ul>
      </AsyncSection>

      <ConfirmDialog
        open={!!withdrawing}
        onOpenChange={(next) => !next && setWithdrawing(null)}
        title="Step back from this task?"
        confirmLabel="Step back"
        pending={withdrawPending}
        message={
          withdrawing && (
            <>
              You give up your claim to{" "}
              <span className="font-mono text-frost">{withdrawing.task_id}</span>. It goes to{" "}
              {withdrawing.standing_count > 2 ? (
                "whoever is still claiming it once everyone else has stepped back"
              ) : (
                <span className="font-semibold text-frost">
                  {otherClaimants(withdrawing)[0]?.full_name ?? "the other claimant"}
                </span>
              )}
              .{" "}
              {withdrawing.involves_billed_work
                ? "This task has already been paid to someone, so settling it will produce an adjustment on a future invoice."
                : "You can take this back while the window is still open."}
            </>
          )
        }
        onConfirm={async () => {
          if (!withdrawing) return;
          await withdraw(withdrawing);
          setWithdrawing(null);
        }}
      />

      <ConfirmDialog
        open={!!revoking}
        onOpenChange={(next) => !next && setRevoking(null)}
        title="Claim this task again?"
        confirmLabel="Claim it again"
        tone="default"
        pending={revokePending}
        message={
          revoking && (
            <>
              <span className="font-mono text-frost">{revoking.task_id}</span> goes back to being
              contested between everyone who logged it. The original deadline still applies, so if
              more than one of you is still claiming it when the time runs out, nobody is paid.
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
