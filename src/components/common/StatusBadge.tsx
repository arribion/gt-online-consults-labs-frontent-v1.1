import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileText,
  Handshake,
  Pause,
  PlayCircle,
  Shield,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { humanize } from "@/lib/format";

type Tone = "neutral" | "info" | "good" | "warn" | "bad";

const toneClass: Record<Tone, string> = {
  neutral: "border-line2/70 bg-ink2 text-mist",
  info: "border-azure/40 bg-azure/12 text-sky2",
  good: "border-good/40 bg-good/12 text-good",
  warn: "border-warn/40 bg-warn/12 text-warn",
  bad: "border-bad/40 bg-bad/12 text-bad",
};

type StatusMeta = { tone: Tone; icon: React.ComponentType<{ className?: string }> };

/**
 * Every status token in the product, mapped once. Status colour is reserved —
 * these tones are never reused as chart series — and each badge carries an icon
 * plus its label so state never rests on colour alone.
 */
const STATUS_META: Record<string, StatusMeta> = {
  // project
  DRAFT: { tone: "neutral", icon: CircleDashed },
  ACTIVE: { tone: "good", icon: CheckCircle2 },
  PAUSED: { tone: "warn", icon: Pause },
  CLOSED: { tone: "neutral", icon: Ban },
  DEACTIVATED: { tone: "bad", icon: Ban },

  // member
  INACTIVE: { tone: "neutral", icon: CircleDashed },
  SUSPENDED: { tone: "bad", icon: Ban },
  PENDING: { tone: "warn", icon: Clock },

  // roles
  TASKER: { tone: "info", icon: UserRound },
  ADMIN: { tone: "info", icon: Shield },
  SUPERADMIN: { tone: "warn", icon: ShieldCheck },

  // assignment
  ASSIGNED: { tone: "info", icon: Handshake },
  IN_PROGRESS: { tone: "info", icon: PlayCircle },
  COMPLETED: { tone: "good", icon: CheckCircle2 },
  CANCELLED: { tone: "neutral", icon: XCircle },
  REMOVED: { tone: "bad", icon: XCircle },

  // task dispute state
  NONE: { tone: "neutral", icon: CircleDashed },
  DISPUTED: { tone: "warn", icon: AlertTriangle },
  RESOLVED: { tone: "good", icon: CheckCircle2 },
  FORFEITED: { tone: "bad", icon: XCircle },

  // invoice
  ISSUED: { tone: "info", icon: FileText },
  PAID: { tone: "good", icon: CheckCircle2 },
  OVERDUE: { tone: "bad", icon: AlertTriangle },
};

const FALLBACK: StatusMeta = { tone: "neutral", icon: CircleDashed };

export function StatusBadge({
  status,
  label,
  className,
  size = "default",
}: {
  status: string | null | undefined;
  label?: string;
  className?: string;
  size?: "default" | "sm";
}) {
  if (!status) return <span className="text-dim">—</span>;
  const key = status.replace(/\s+/g, "_").toUpperCase();
  const { tone, icon: Icon } = STATUS_META[key] ?? FALLBACK;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        toneClass[tone],
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label ?? humanize(status)}
    </span>
  );
}

/** A count pill for nav items and section headers (open disputes, row totals). */
export function CountPill({
  count,
  tone = "info",
  className,
}: {
  count: number;
  tone?: Tone;
  className?: string;
}) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[10px] font-bold tabular-nums",
        toneClass[tone],
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
