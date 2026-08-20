import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one card surface in the app. Everything that needs a raised container —
 * charts, tables, forms, stat groups — uses this, so corner radius, border and
 * shadow can never drift between screens.
 */
export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-line/80 bg-card shadow-card",
        padded && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-display text-base font-semibold text-frost">{title}</h2>
        {description && <p className="mt-1 text-sm text-mist">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/** Page-level heading. Actions wrap below the title on narrow screens. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky2">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-frost sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-mist">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
