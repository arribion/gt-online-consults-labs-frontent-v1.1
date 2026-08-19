import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  DataTable,
  DonutChart,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  RankedBarChart,
  SelectFilter,
  StatCard,
  StatGrid,
  STATUS_COLORS,
  foldToSeries,
} from "@/components/common";
import { GenerateInvoiceDialog } from "@/components/invoices/GenerateInvoiceDialog";
import { invoiceColumns } from "@/components/invoices/invoiceColumns";
import { useAsync } from "@/hooks/useAsync";
import { useAllProjects, useMembers } from "@/hooks/useLookups";
import { invoicesService } from "@/services";
import { sumBy, toRanked } from "@/lib/aggregate";
import { formatCurrency } from "@/lib/format";
import { INVOICE_STATUSES, type Invoice } from "@/types";

const STATUS_OPTIONS = INVOICE_STATUSES.map((value) => ({ value, label: value }));

const STATUS_TONE: Record<string, string> = {
  Draft: STATUS_COLORS.neutral,
  Issued: "#1f7fd6",
  Paid: STATUS_COLORS.good,
  Overdue: STATUS_COLORS.bad,
};

export default function AdminInvoicing() {
  const navigate = useNavigate();
  const { options: projectOptions, nameById: projectNames } = useAllProjects();
  const { taskerOptions, nameById: memberNames } = useMembers();

  const [projectId, setProjectId] = useState("");
  const [taskerId, setTaskerId] = useState("");
  const [status, setStatus] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data, loading, error, refetch } = useAsync<Invoice[]>(
    () =>
      invoicesService.list({
        projectId: projectId || undefined,
        taskerId: taskerId || undefined,
        status: (status || undefined) as Invoice["status"] | undefined,
      }),
    [projectId, taskerId, status],
    [],
  );

  const totals = useMemo(() => {
    const paid = data.filter((invoice) => invoice.status === "Paid");
    const overdue = data.filter((invoice) => invoice.status === "Overdue");
    const outstanding = data.filter((invoice) => invoice.status !== "Paid");
    return {
      all: data.reduce((sum, invoice) => sum + invoice.total, 0),
      paid: paid.reduce((sum, invoice) => sum + invoice.total, 0),
      outstanding: outstanding.reduce((sum, invoice) => sum + invoice.total, 0),
      overdueCount: overdue.length,
      outstandingCount: outstanding.length,
    };
  }, [data]);

  const byStatus = useMemo(() => {
    const buckets = sumBy(data, (invoice) => invoice.status, (invoice) => invoice.total);
    return [...buckets.entries()].map(([label, value]) => ({
      label,
      value,
      color: STATUS_TONE[label] ?? STATUS_COLORS.neutral,
    }));
  }, [data]);

  const byTasker = useMemo(() => {
    const totalsByTasker = sumBy(data, (invoice) => invoice.party_id, (invoice) => invoice.total);
    const ranked = toRanked(totalsByTasker, (id) => memberNames.get(id) ?? "Unknown");
    return foldToSeries(ranked, (row) => row.value, (row) => row.label);
  }, [data, memberNames]);

  const activeFilters = [projectId, taskerId, status].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Invoicing"
        description="Generate invoices on a tasker's behalf, track what's been paid, and download the PDF for any of them."
        actions={
          <Button onClick={() => setGenerating(true)}>
            <Plus className="h-4 w-4" /> Generate invoice
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard label="Invoiced" value={formatCurrency(totals.all)} icon={Receipt} />
        <StatCard label="Paid" value={formatCurrency(totals.paid)} tone="good" icon={CheckCircle2} />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totals.outstanding)}
          tone={totals.outstanding ? "warn" : "default"}
          hint={`${totals.outstandingCount} not yet marked paid`}
          icon={Clock}
        />
        <StatCard
          label="Overdue"
          value={totals.overdueCount}
          tone={totals.overdueCount ? "bad" : "default"}
          hint="Flagged as overdue"
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <DonutChart
          title="Invoiced value by status"
          description="Where the money currently sits."
          data={byStatus}
          total={formatCurrency(totals.all)}
          totalLabel="total invoiced"
          format={formatCurrency}
        />
        <RankedBarChart
          title="Invoiced by tasker"
          description="Total value invoiced per person under these filters."
          data={byTasker}
          format={formatCurrency}
        />
      </div>

      <Panel className="space-y-4">
        <FilterBar
          active={activeFilters}
          onReset={() => {
            setProjectId("");
            setTaskerId("");
            setStatus("");
          }}
        >
          <SelectFilter
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
            allLabel="All projects"
          />
          <SelectFilter
            label="Tasker"
            value={taskerId}
            onChange={setTaskerId}
            options={taskerOptions}
            allLabel="All taskers"
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
              title={activeFilters ? "Nothing matches these filters" : "No invoices generated yet"}
              description="An invoice bills every Completed, undisputed task for one tasker, project and period."
              action={
                <Button size="sm" onClick={() => setGenerating(true)}>
                  Generate an invoice
                </Button>
              }
            />
          }
        >
          <DataTable
            rows={data}
            columns={invoiceColumns({
              projectName: (id) => (id ? (projectNames.get(id) ?? "—") : "—"),
              taskerName: (id) => (id ? (memberNames.get(id) ?? "—") : "—"),
            })}
            getRowKey={(invoice) => invoice.id}
            onRowClick={(invoice) => navigate(`/admin/invoices/${invoice.id}`)}
            pageSize={20}
          />
        </AsyncSection>
      </Panel>

      <GenerateInvoiceDialog
        open={generating}
        onOpenChange={setGenerating}
        projectOptions={projectOptions}
        taskerOptions={taskerOptions}
        onGenerated={(invoice) => {
          void refetch();
          navigate(`/admin/invoices/${invoice.id}`);
        }}
      />
    </>
  );
}
