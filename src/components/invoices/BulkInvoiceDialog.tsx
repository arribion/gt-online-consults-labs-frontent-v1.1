import { useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  EmptyState,
  FormGrid,
  Modal,
  TextField,
  type Column,
} from "@/components/common";
import { useMutation } from "@/hooks/useAsync";
import { invoicesService } from "@/services";
import { lastDays } from "@/lib/aggregate";
import { formatCurrency, formatMinutes } from "@/lib/format";
import type { BulkInvoiceLine, BulkInvoiceResult, SelectOption } from "@/types";

/**
 * Invoice a whole period in one pass.
 *
 * Deliberately two steps: a dry run that costs everything and writes nothing,
 * then the commit. An invoice can't be un-generated, and a mis-scoped bulk run
 * would mean chasing dozens of them — so the preview is not optional here, it
 * is the flow.
 */
export function BulkInvoiceDialog({
  open,
  onOpenChange,
  projectOptions,
  taskerOptions,
  onGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectOptions: SelectOption[];
  taskerOptions: SelectOption[];
  onGenerated: () => void;
}) {
  const defaults = lastDays(30);
  const [periodStart, setPeriodStart] = useState(defaults.from);
  const [periodEnd, setPeriodEnd] = useState(defaults.to);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [taskerIds, setTaskerIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<BulkInvoiceResult | null>(null);
  const [error, setError] = useState("");

  const payload = {
    period_start: periodStart,
    period_end: periodEnd,
    project_ids: projectIds.length ? projectIds : undefined,
    tasker_ids: taskerIds.length ? taskerIds : undefined,
  };

  const { mutate: runPreview, pending: previewing } = useMutation(
    () => invoicesService.generateBulk({ ...payload, dry_run: true }),
    { onDone: setPreview },
  );

  const { mutate: commit, pending: committing } = useMutation(
    () => invoicesService.generateBulk(payload),
    {
      onDone: (result) => {
        setPreview(result);
        onGenerated();
      },
    },
  );

  const reset = () => {
    setPreview(null);
    setError("");
    setProjectIds([]);
    setTaskerIds([]);
  };

  const handlePreview = async (event: FormEvent) => {
    event.preventDefault();
    if (periodEnd < periodStart) return setError("The period end can't be before its start.");
    setError("");
    await runPreview();
  };

  const columns: Column<BulkInvoiceLine>[] = [
    {
      key: "tasker",
      header: "Tasker",
      mobile: "primary",
      sortValue: (line) => line.tasker_name,
      cell: (line) => <span className="font-semibold text-frost">{line.tasker_name}</span>,
    },
    {
      key: "project",
      header: "Project",
      sortValue: (line) => line.project_name,
      cell: (line) => line.project_name,
    },
    {
      key: "tasks",
      header: "Tasks",
      align: "right",
      sortValue: (line) => line.billable_tasks,
      cell: (line) =>
        line.billable_tasks ? (
          <span className="text-sm">
            {line.billable_tasks}
            {line.carried_over > 0 && (
              <span
                className="ml-1.5 text-[11px] text-sky2"
                title={`${line.carried_over} of these predate the period — work that only became billable after its own period was invoiced`}
              >
                +{line.carried_over} carried
              </span>
            )}
          </span>
        ) : (
          <span className="text-xs text-dim">—</span>
        ),
    },
    {
      key: "time",
      header: "Billable",
      align: "right",
      sortValue: (line) => line.billable_minutes,
      cell: (line) =>
        line.billable_minutes ? (
          <span className="text-xs text-mist">{formatMinutes(line.billable_minutes)}</span>
        ) : (
          <span className="text-xs text-dim">—</span>
        ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      mobile: "secondary",
      sortValue: (line) => line.total,
      cell: (line) =>
        line.total ? (
          <span className="font-semibold text-frost">{formatCurrency(line.total)}</span>
        ) : (
          <span className="text-xs text-dim">{line.reason}</span>
        ),
    },
  ];

  const billable = preview?.lines.filter((line) => line.billable_tasks > 0) ?? [];
  const skipped = preview?.lines.filter((line) => line.billable_tasks === 0) ?? [];
  const committed = preview?.dry_run === false;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="Generate invoices in bulk"
      description="One invoice per tasker per project. A tasker on two projects gets two invoices — a single invoice carries one rate and one cap."
      size="lg"
    >
      {!preview ? (
        <form id="bulk-invoice" onSubmit={handlePreview} className="space-y-4">
          {error && (
            <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
              {error}
            </p>
          )}

          <FormGrid>
            <TextField
              label="Period start"
              type="date"
              required
              value={periodStart}
              max={periodEnd}
              onChange={(event) => setPeriodStart(event.target.value)}
              className="[color-scheme:dark]"
            />
            <TextField
              label="Period end"
              type="date"
              required
              value={periodEnd}
              min={periodStart}
              onChange={(event) => setPeriodEnd(event.target.value)}
              className="[color-scheme:dark]"
            />
          </FormGrid>

          <MultiSelect
            label="Projects"
            hint="Leave empty for every active project."
            options={projectOptions}
            selected={projectIds}
            onChange={setProjectIds}
          />
          <MultiSelect
            label="Taskers"
            hint="Leave empty for everyone with an assignment."
            options={taskerOptions}
            selected={taskerIds}
            onChange={setTaskerIds}
          />

          <p className="rounded-lg border border-line bg-ink2/40 px-3 py-2.5 text-xs text-mist">
            Work that was under dispute when its own period was billed, and has since resolved, is
            picked up automatically here — dated in the past, but billed exactly once.
          </p>
        </form>
      ) : (
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 rounded-xl border p-3.5 ${
              committed ? "border-good/40 bg-good/10" : "border-azure/40 bg-azure/10"
            }`}
          >
            {committed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" />
            ) : (
              <Search className="mt-0.5 h-4 w-4 shrink-0 text-sky2" />
            )}
            <div>
              <p className="text-sm font-semibold text-frost">
                {committed
                  ? `${preview.generated_count} invoice${preview.generated_count === 1 ? "" : "s"} generated`
                  : `${billable.length} invoice${billable.length === 1 ? "" : "s"} would be generated`}
              </p>
              <p className="mt-0.5 text-sm text-mist">
                {formatCurrency(preview.total_value)} in total
                {skipped.length > 0 && ` · ${skipped.length} pair${skipped.length === 1 ? "" : "s"} with nothing to bill`}
                {!committed && " · nothing has been written yet"}
              </p>
            </div>
          </div>

          {billable.length ? (
            <DataTable
              rows={preview.lines}
              columns={columns}
              getRowKey={(line) => `${line.tasker_id}-${line.project_id}`}
              pageSize={12}
            />
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="Nothing to invoice in this period"
              description="Every tasker/project pair either has no completed work, or has already been invoiced for it."
            />
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {!preview ? (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={previewing}>
              Cancel
            </Button>
            <Button type="submit" form="bulk-invoice" disabled={previewing}>
              <Search className="h-4 w-4" /> {previewing ? "Checking…" : "Preview"}
            </Button>
          </>
        ) : committed ? (
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => setPreview(null)} disabled={committing}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button disabled={committing || !billable.length} onClick={() => void commit()}>
              <Layers className="h-4 w-4" />
              {committing
                ? "Generating…"
                : `Generate ${billable.length} invoice${billable.length === 1 ? "" : "s"}`}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}

/** Checkbox list — a native multi-select is close to unusable on a phone. */
function MultiSelect({
  label,
  hint,
  options,
  selected,
  onChange,
}: {
  label: string;
  hint: string;
  options: SelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-mist">
        {label}
        {selected.length > 0 && <span className="ml-1.5 text-sky2">({selected.length})</span>}
      </legend>
      <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-line bg-ink2/50 p-2">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm text-frost transition-colors hover:bg-panel2/60"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onChange(
                    checked
                      ? selected.filter((value) => value !== option.value)
                      : [...selected, option.value],
                  )
                }
                className="h-4 w-4 accent-azure"
              />
              <span className="truncate">{option.label}</span>
            </label>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-dim">{hint}</p>
    </fieldset>
  );
}
