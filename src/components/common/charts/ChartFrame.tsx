import { useState, type ReactNode } from "react";
import { Table2, ChartColumnBig } from "lucide-react";
import { cn } from "@/lib/utils";

export type LegendEntry = { label: string; color: string; value?: string };

/**
 * Title, legend, and a table fallback for every chart.
 *
 * The table view is not decoration: it is how the data stays readable for
 * screen readers, in forced-colours mode, and for anyone who can't separate two
 * hues. Any chart with a colour encoding ships with one.
 */
export function ChartFrame({
  title,
  description,
  legend,
  height = 260,
  table,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  legend?: LegendEntry[];
  height?: number;
  /** Rows rendered when the reader flips to the table view. */
  table?: { columns: string[]; rows: (string | number)[][] };
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <figure
      className={cn(
        "rounded-2xl border border-line/80 bg-card p-4 shadow-card sm:p-5",
        className,
      )}
    >
      <figcaption className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold text-frost">{title}</h3>
          {description && <p className="mt-1 text-xs text-mist">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {table && (
            <button
              type="button"
              onClick={() => setShowTable((current) => !current)}
              aria-pressed={showTable}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-mist transition-colors hover:border-azure/50 hover:text-sky2"
            >
              {showTable ? (
                <>
                  <ChartColumnBig className="h-3.5 w-3.5" /> Chart
                </>
              ) : (
                <>
                  <Table2 className="h-3.5 w-3.5" /> Table
                </>
              )}
            </button>
          )}
        </div>
      </figcaption>

      {legend && legend.length > 1 && !showTable && (
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {legend.map((entry) => (
            <li key={entry.label} className="flex items-center gap-1.5 text-xs text-mist">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">{entry.label}</span>
              {entry.value && <span className="tabular-nums text-frost/80">{entry.value}</span>}
            </li>
          ))}
        </ul>
      )}

      {showTable && table ? (
        <div className="scroll-x mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                {table.columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      "px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-dim",
                      index === 0 ? "text-left" : "text-right",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={String(row[0])} className="border-b border-line/50 last:border-0">
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className={cn(
                        "px-2 py-2 text-frost/90",
                        index === 0 ? "text-left" : "text-right tabular-nums",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 w-full" style={{ height }}>
          {children}
        </div>
      )}
    </figure>
  );
}

/** Tooltip body shared by every chart, so hover reads the same everywhere. */
export function ChartTooltip({
  active,
  label,
  items,
}: {
  active?: boolean;
  label?: ReactNode;
  items: { name: string; value: ReactNode; color: string }[];
}) {
  if (!active || !items.length) return null;
  return (
    <div className="rounded-lg border border-line2 bg-popover/95 px-3 py-2 shadow-card-hover backdrop-blur">
      {label != null && <p className="mb-1 text-[11px] font-semibold text-mist">{label}</p>}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-mist">{item.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-frost">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
