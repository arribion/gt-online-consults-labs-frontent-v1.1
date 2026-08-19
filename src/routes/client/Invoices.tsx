import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  DataTable,
  DonutChart,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SelectFilter,
  StatCard,
  StatGrid,
  STATUS_COLORS,
} from "@/components/common";
import { GenerateInvoiceDialog } from "@/components/invoices/GenerateInvoiceDialog";
import { invoiceColumns } from "@/components/invoices/invoiceColumns";
import { useAsync } from "@/hooks/useAsync";
import { useAllProjects, useMyProjects } from "@/hooks/useLookups";
import { invoicesService } from "@/services";
import { formatCurrency } from "@/lib/format";
import { INVOICE_STATUSES, type Invoice } from "@/types";

const STATUS_OPTIONS = INVOICE_STATUSES.map((value) => ({ value, label: value }));

const STATUS_TONE: Record<string, string> = {
  Draft: STATUS_COLORS.neutral,
  Issued: "#1f7fd6",
  Paid: STATUS_COLORS.good,
  Overdue: STATUS_COLORS.bad,
};

export default function Invoices() {
  const navigate = useNavigate();
  const { nameById } = useAllProjects();
  const { options: myProjectOptions } = useMyProjects();

  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data, loading, error, refetch } = useAsync<Invoice[]>(
    () =>
      invoicesService.list({
        projectId: projectId || undefined,
        status: (status || undefined) as Invoice["status"] | undefined,
      }),
    [projectId, status],
    [],
  );

  const totals = useMemo(() => {
    const paid = data.filter((invoice) => invoice.status === "Paid");
    const outstanding = data.filter((invoice) => invoice.status !== "Paid");
    return {
      all: data.reduce((sum, invoice) => sum + invoice.total, 0),
      paid: paid.reduce((sum, invoice) => sum + invoice.total, 0),
      outstanding: outstanding.reduce((sum, invoice) => sum + invoice.total, 0),
      outstandingCount: outstanding.length,
    };
  }, [data]);

  const byStatus = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const invoice of data) {
      buckets.set(invoice.status, (buckets.get(invoice.status) ?? 0) + invoice.total);
    }
    return [...buckets.entries()].map(([label, value]) => ({
      label,
      value,
      color: STATUS_TONE[label] ?? STATUS_COLORS.neutral,
    }));
  }, [data]);

  const activeFilters = [projectId, status].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="My invoices"
        description="One invoice covers one project for one period. Your rate and payment rate are applied automatically — you can't set them yourself."
        actions={
          <Button onClick={() => setGenerating(true)} disabled={!myProjectOptions.length}>
            <Plus className="h-4 w-4" /> Generate invoice
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-3">
        <StatCard label="Invoiced" value={formatCurrency(totals.all)} icon={Receipt} />
        <StatCard label="Paid" value={formatCurrency(totals.paid)} tone="good" />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totals.outstanding)}
          tone={totals.outstanding ? "warn" : "default"}
          hint={`${totals.outstandingCount} invoice${totals.outstandingCount === 1 ? "" : "s"} not yet marked paid`}
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="space-y-4 lg:col-span-2">
          <FilterBar
            active={activeFilters}
            onReset={() => {
              setProjectId("");
              setStatus("");
            }}
          >
            <SelectFilter
              label="Project"
              value={projectId}
              onChange={setProjectId}
              options={myProjectOptions}
              allLabel="All projects"
            />
            <SelectFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              allLabel="Any status"
            />
          </FilterBar>

          <AsyncSection
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={!data.length}
            empty={
              <EmptyState
                icon={Receipt}
                title="No invoices yet"
                description="Generate one for a project and period once you've logged some completed tasks."
                action={
                  <Button size="sm" onClick={() => setGenerating(true)} disabled={!myProjectOptions.length}>
                    Generate your first invoice
                  </Button>
                }
              />
            }
          >
            <DataTable
              rows={data}
              columns={invoiceColumns({
                projectName: (id) => (id ? (nameById.get(id) ?? "—") : "—"),
              })}
              getRowKey={(invoice) => invoice.id}
              onRowClick={(invoice) => navigate(`/client/invoices/${invoice.id}`)}
              pageSize={15}
            />
          </AsyncSection>
        </Panel>

        <DonutChart
          title="Invoiced by status"
          description="Value of every invoice matching the current filters."
          data={byStatus}
          total={formatCurrency(totals.all)}
          totalLabel="total invoiced"
          format={formatCurrency}
          emptyLabel="Generate an invoice and this fills in."
        />
      </div>

      <GenerateInvoiceDialog
        open={generating}
        onOpenChange={setGenerating}
        projectOptions={myProjectOptions}
        onGenerated={(invoice) => {
          void refetch();
          navigate(`/client/invoices/${invoice.id}`);
        }}
      />
    </>
  );
}
