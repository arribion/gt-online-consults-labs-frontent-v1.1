import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Placeholder rows sized like the table they replace, so the layout doesn't jump. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className="h-9 flex-1 animate-pulse rounded-lg bg-line/60"
              style={{ animationDelay: `${(rowIndex * columns + columnIndex) * 40}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn("h-28 animate-pulse rounded-2xl bg-line/50", className)} aria-hidden />;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-line2/70 bg-ink2 text-sky2">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-frost">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-mist">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-frost">Couldn't load this</p>
        <p className="mt-1 max-w-sm text-sm text-mist">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}

/**
 * The loading → error → empty → content ladder, in one place. Every list and
 * chart on every screen runs through it, so the four states always look alike.
 */
export function AsyncSection({
  loading,
  error,
  isEmpty,
  onRetry,
  skeleton,
  empty,
  children,
}: {
  loading: boolean;
  error: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  skeleton?: ReactNode;
  empty?: ReactNode;
  children: ReactNode;
}) {
  if (loading) return <>{skeleton ?? <TableSkeleton />}</>;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  return <>{children}</>;
}

export function FullPageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-line2 border-t-azure" />
        <p className="text-sm text-mist">{label}…</p>
      </div>
    </div>
  );
}
