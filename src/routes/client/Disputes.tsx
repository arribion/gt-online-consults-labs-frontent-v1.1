import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  AsyncSection,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  SegmentedFilter,
} from "@/components/common";
import { DisputeCard } from "@/components/disputes/DisputeCard";
import { useAsync, useMutation } from "@/hooks/useAsync";
import { useMyProjects } from "@/hooks/useLookups";
import { useAuth } from "@/hooks/useAuth";
import { disputesService } from "@/services";
import type { Dispute } from "@/types";

const TABS = [
  { value: "open", label: "Needs action" },
  { value: "history", label: "History" },
];

export default function Disputes() {
  const { user } = useAuth();
  const { nameById } = useMyProjects();
  const [tab, setTab] = useState("open");
  const [confirming, setConfirming] = useState<Dispute | null>(null);

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

  const { open, history } = useMemo(
    () => ({
      open: data.filter((dispute) => dispute.status === "PENDING"),
      history: data.filter((dispute) => dispute.status !== "PENDING"),
    }),
    [data],
  );

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
          task, the other confirms, and the task transfers to the claimant. Five days after it was
          raised, an unresolved dispute forfeits — <span className="text-frost">both</span> entries
          drop out of invoicing permanently.
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
              pending={claiming || confirmingPending}
            />
          ))}
        </ul>
      </AsyncSection>

      {history.length > 0 && tab === "open" && (
        <Panel>
          <PanelHeader
            title="Earlier disputes"
            description={`${history.length} settled — switch to History to review them.`}
          />
        </Panel>
      )}

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
              and forfeits your own entry for it. It can't be undone.
            </>
          )
        }
        onConfirm={async () => {
          if (!confirming) return;
          await confirm(confirming);
          setConfirming(null);
        }}
      />
    </>
  );
}
