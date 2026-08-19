import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormGrid, Modal, SelectField, TextField } from "@/components/common";
import { useMutation } from "@/hooks/useAsync";
import { invoicesService } from "@/services";
import { lastDays } from "@/lib/aggregate";
import type { Invoice, SelectOption } from "@/types";

/**
 * Generate an invoice for one tasker × one project × one period.
 *
 * A combined multi-project invoice isn't offered because the PDF carries a
 * single rate and cap — that constraint is deliberate, so the UI asks for one
 * project rather than silently producing something the template can't express.
 *
 * A tasker never sees the rate fields: sending them is a 403, since their own
 * rate and payment rate are always server-computed.
 */
export function GenerateInvoiceDialog({
  open,
  onOpenChange,
  projectOptions,
  taskerOptions,
  onGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectOptions: SelectOption[];
  /** Admin only — omit to generate for the signed-in tasker. */
  taskerOptions?: SelectOption[];
  onGenerated: (invoice: Invoice) => void;
}) {
  const defaults = lastDays(30);
  const [projectId, setProjectId] = useState("");
  const [taskerId, setTaskerId] = useState("");
  const [periodStart, setPeriodStart] = useState(defaults.from);
  const [periodEnd, setPeriodEnd] = useState(defaults.to);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [rate, setRate] = useState("");
  const [paymentRate, setPaymentRate] = useState("");
  const [error, setError] = useState("");

  const isAdmin = !!taskerOptions;

  const { mutate: generate, pending } = useMutation(
    () =>
      invoicesService.generate({
        project_id: projectId,
        period_start: periodStart,
        period_end: periodEnd,
        invoice_number: invoiceNumber.trim() || undefined,
        ...(isAdmin
          ? {
              tasker_id: taskerId,
              rate: rate ? Number(rate) : undefined,
              payment_rate: paymentRate ? Number(paymentRate) : undefined,
            }
          : {}),
      }),
    {
      success: "Invoice generated.",
      onDone: (invoice) => {
        onGenerated(invoice);
        onOpenChange(false);
      },
    },
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectId) return setError("Choose a project.");
    if (isAdmin && !taskerId) return setError("Choose the tasker to invoice.");
    if (periodEnd < periodStart) return setError("The period end can't be before its start.");
    setError("");
    await generate();
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Generate an invoice"
      description="Bills every Completed, undisputed task in the period. Disputed, forfeited and non-completed rows are listed as exclusions instead."
    >
      <form id="generate-invoice" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}

        <FormGrid>
          <SelectField
            label="Project"
            required
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            options={projectOptions}
            placeholder="Choose a project…"
            wrapperClassName={isAdmin ? undefined : "sm:col-span-2"}
          />
          {isAdmin && (
            <SelectField
              label="Tasker"
              required
              value={taskerId}
              onChange={(event) => setTaskerId(event.target.value)}
              options={taskerOptions}
              placeholder="Choose a tasker…"
            />
          )}
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
          <TextField
            label="Invoice number"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            placeholder="Generated automatically"
            hint="Leave blank to let the system number it."
            wrapperClassName="sm:col-span-2"
          />
        </FormGrid>

        {isAdmin && (
          <fieldset className="rounded-xl border border-line bg-ink2/40 p-3.5">
            <legend className="px-1 text-xs font-semibold text-mist">Overrides (optional)</legend>
            <p className="mb-3 text-xs text-dim">
              Left blank, the invoice uses the project's default rate and the tasker's own payment
              rate.
            </p>
            <FormGrid>
              <TextField
                label="Rate ($/hr)"
                type="number"
                min={0}
                step="0.01"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                placeholder="Project default"
              />
              <TextField
                label="Payment rate (%)"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={paymentRate}
                onChange={(event) => setPaymentRate(event.target.value)}
                placeholder="Tasker default"
              />
            </FormGrid>
          </fieldset>
        )}
      </form>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" form="generate-invoice" disabled={pending}>
          {pending ? "Generating…" : "Generate invoice"}
        </Button>
      </div>
    </Modal>
  );
}
