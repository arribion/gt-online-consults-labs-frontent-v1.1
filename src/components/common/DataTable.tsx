import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /**
   * How the column behaves on a phone, where there is no table:
   *  - "primary"/"secondary" become the card's title and subtitle
   *  - "row" (the default) becomes a label/value line
   *  - "hidden" drops out entirely
   */
  mobile?: "primary" | "secondary" | "row" | "hidden";
  align?: "left" | "right";
  /** Supplying this makes the column sortable. */
  sortValue?: (row: T) => string | number;
  width?: string;
};

type SortState = { key: string; direction: "asc" | "desc" } | null;

/**
 * One table component for the whole app.
 *
 * Below `md` it is not a table at all — each row renders as a card, because a
 * horizontally scrolling seven-column table is unusable on a phone. From `md`
 * up it is a real `<table>` inside a horizontal scroll container, so a wide
 * table never forces the page itself to scroll sideways.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  onRowClick,
  pageSize,
  emptyLabel = "No rows to show",
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Omit to render every row without pagination. */
  pageSize?: number;
  emptyLabel?: string;
  className?: string;
}) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((candidate) => candidate.key === sort.key);
    if (!column?.sortValue) return rows;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      if (left === right) return 0;
      return left > right ? factor : -factor;
    });
  }, [rows, columns, sort]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visible = pageSize ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize) : sorted;

  const toggleSort = (column: Column<T>) => {
    if (!column.sortValue) return;
    setPage(0);
    setSort((current) =>
      current?.key === column.key
        ? current.direction === "asc"
          ? { key: column.key, direction: "desc" }
          : null
        : { key: column.key, direction: "asc" },
    );
  };

  if (!rows.length) {
    return <p className="px-1 py-8 text-center text-sm text-mist">{emptyLabel}</p>;
  }

  const cardColumns = columns.filter((column) => column.mobile !== "hidden");
  const primary = cardColumns.find((column) => column.mobile === "primary") ?? cardColumns[0];
  const secondary = cardColumns.find((column) => column.mobile === "secondary");
  const detailColumns = cardColumns.filter(
    (column) => column !== primary && column !== secondary,
  );

  return (
    <div className={className}>
      {/* phones: one card per row */}
      <ul className="space-y-2.5 md:hidden">
        {visible.map((row) => (
          <li key={getRowKey(row)}>
            <div
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              className={cn(
                "rounded-xl border border-line/80 bg-ink2/60 p-3.5",
                onRowClick && "cursor-pointer transition-colors hover:border-azure/50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-sm font-semibold text-frost">{primary.cell(row)}</div>
                {secondary && <div className="shrink-0 text-sm">{secondary.cell(row)}</div>}
              </div>
              {detailColumns.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                  {detailColumns.map((column) => (
                    <div key={column.key} className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-dim">
                        {column.header}
                      </dt>
                      <dd className="mt-0.5 truncate text-sm text-frost/90">{column.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* tablet and up: a real table, scrolling inside its own container */}
      <div className="scroll-x hidden md:block">
        <table className="w-full min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(
                    "whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-dim",
                    column.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded transition-colors hover:text-sky2",
                        column.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {column.header}
                      {sort?.key === column.key ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-line/50 transition-colors last:border-0",
                  onRowClick ? "cursor-pointer hover:bg-panel2/60" : "hover:bg-panel2/35",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-3 py-3 align-middle text-frost/90",
                      column.align === "right" && "text-right tabular-nums",
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageSize && pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-mist">
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{" "}
            {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs tabular-nums text-mist">
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
