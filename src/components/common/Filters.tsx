import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SelectOption } from "@/types";

/**
 * Filters sit in one row above the content they filter, and wrap onto more rows
 * on a phone rather than collapsing behind a menu.
 */
export function FilterBar({
  children,
  onReset,
  active,
  className,
}: {
  children: ReactNode;
  onReset?: () => void;
  /** Number of filters currently applied — drives the reset affordance. */
  active?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end gap-2.5", className)}>
      {children}
      {onReset && !!active && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-mist">
          <X className="h-3.5 w-3.5" /> Clear {active}
        </Button>
      )}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0 flex-1 sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-ink2/70 pl-9 pr-3 text-sm text-frost placeholder:text-dim focus:border-azure focus:outline-none"
      />
    </div>
  );
}

/**
 * A plain `<select>` rather than a Radix listbox: on mobile the native picker is
 * both faster and more accessible than a custom popover.
 */
export function SelectFilter({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Pass null to make the filter required (no "all" entry). */
  allLabel?: string | null;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-dim">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-[9rem] rounded-lg border border-line bg-ink2/70 px-3 text-sm text-frost focus:border-azure focus:outline-none"
      >
        {allLabel !== null && <option value="">{allLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DateFilter({
  label,
  value,
  onChange,
  max,
  min,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-dim">{label}</span>
      <input
        type="date"
        value={value}
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-ink2/70 px-3 text-sm text-frost [color-scheme:dark] focus:border-azure focus:outline-none"
      />
    </label>
  );
}

/** Segmented control for a small, mutually exclusive choice (2–4 options). */
export function SegmentedFilter({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-lg border border-line bg-ink2/70 p-0.5 text-sm",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[7px] px-3 py-1.5 text-xs font-semibold transition-colors",
            value === option.value
              ? "bg-azure/20 text-sky2"
              : "text-mist hover:text-frost",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
