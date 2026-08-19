import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type Column } from "@/components/common";
import { formatCurrency, formatDate, formatMinutes } from "@/lib/format";
import { invoiceBilledMinutes, type Invoice } from "@/types";
import { invoicesService } from "@/services";

/** Shared invoice list columns. `extra` slots in the admin-only tasker column. */
export function invoiceColumns({
  projectName,
  taskerName,
}: {
  projectName: (projectId: string | null) => string;
  /** Supplying this adds the tasker column — admin views only. */
  taskerName?: (partyId: string | null) => string;
}): Column<Invoice>[] {
  const columns: Column<Invoice>[] = [
    {
      key: "external_id",
      header: "Invoice",
      mobile: "primary",
      sortValue: (invoice) => invoice.external_id,
      cell: (invoice) => (
        <span className="font-mono text-xs text-frost">{invoice.external_id}</span>
      ),
    },
    {
      key: "project",
      header: "Project",
      sortValue: (invoice) => projectName(invoice.project_id),
      cell: (invoice) => projectName(invoice.project_id),
    },
    {
      key: "period",
      header: "Period",
      sortValue: (invoice) => invoice.period_start ?? "",
      cell: (invoice) => (
        <span className="whitespace-nowrap text-xs text-mist">
          {formatDate(invoice.period_start)} – {formatDate(invoice.period_end)}
        </span>
      ),
    },
    {
      key: "billed",
      header: "Billed",
      align: "right",
      sortValue: (invoice) => invoiceBilledMinutes(invoice),
      cell: (invoice) => (
        <span className="text-xs text-mist">{formatMinutes(invoiceBilledMinutes(invoice))}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortValue: (invoice) => invoice.total,
      cell: (invoice) => (
        <span className="font-semibold text-frost">{formatCurrency(invoice.total)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "secondary",
      sortValue: (invoice) => invoice.status,
      cell: (invoice) => <StatusBadge status={invoice.status} size="sm" />,
    },
    {
      key: "pdf",
      header: "PDF",
      align: "right",
      cell: (invoice) => (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Download ${invoice.external_id}`}
          onClick={(event) => {
            event.stopPropagation();
            void invoicesService.downloadPdf(invoice);
          }}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  if (taskerName) {
    columns.splice(1, 0, {
      key: "tasker",
      header: "Tasker",
      sortValue: (invoice) => taskerName(invoice.party_id),
      cell: (invoice) => taskerName(invoice.party_id),
    });
  }

  return columns;
}
