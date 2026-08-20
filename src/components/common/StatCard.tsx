import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { IconComponent } from "@/types";

type Tone = "default" | "good" | "warn" | "bad";

const accent: Record<Tone, string> = {
  default: "border-azure/30 bg-azure/10 text-sky2",
  good: "border-good/30 bg-good/10 text-good",
  warn: "border-warn/30 bg-warn/10 text-warn",
  bad: "border-bad/30 bg-bad/10 text-bad",
};

/**
 * A single number with its label — the right form when there is one figure to
 * report and no shape to show. The optional `hint` carries the context that a
 * sparkline would otherwise be asked to imply.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  to,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: IconComponent;
  tone?: Tone;
  /** Makes the whole tile a link — used to send people to the filtered list. */
  to?: string;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-mist">{label}</p>
        {Icon && (
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg border", accent[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight text-frost">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-dim">{hint}</p>}
    </>
  );

  const shell = cn(
    "rounded-2xl border border-line/80 bg-card p-4 shadow-card",
    to && "block transition-colors hover:border-azure/50",
    className,
  );

  return to ? (
    <Link to={to} className={shell}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

/** Responsive tile row: 2-up on a phone, 4-up on a desktop. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>{children}</div>
  );
}
