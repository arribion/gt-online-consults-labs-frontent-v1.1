/** Display formatting used across every screen, so numbers read the same everywhere. */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number | null | undefined): string =>
  currencyFormatter.format(value ?? 0);

export const formatNumber = (value: number | null | undefined): string =>
  (value ?? 0).toLocaleString("en-US");

export const formatPercent = (value: number | null | undefined): string =>
  `${(value ?? 0).toFixed(value != null && Number.isInteger(value) ? 0 : 1)}%`;

/** "3h 25m" — the shape people actually reason about when checking a task log. */
export const formatMinutes = (minutes: number | null | undefined): string => {
  const total = Math.max(0, Math.round(minutes ?? 0));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
};

export const minutesToHours = (minutes: number | null | undefined): number =>
  Math.round(((minutes ?? 0) / 60) * 100) / 100;

export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return `${formatDate(date)} · ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

/** `YYYY-MM-DD`, the shape every date input and date query param wants. */
export const toDateInput = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const formatRelative = (value: string | null | undefined): string => {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const diffDays = Math.round((then - Date.now()) / 86_400_000);
  if (Math.abs(diffDays) >= 30) return formatDate(value);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, "day");
  const diffHours = Math.round((then - Date.now()) / 3_600_000);
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, "hour");
  return rtf.format(Math.round((then - Date.now()) / 60_000), "minute");
};

export const initials = (name: string | null | undefined): string =>
  (name ?? "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

/** Turn an enum-ish token like `IN_PROGRESS` into `In progress`. */
export const humanize = (value: string | null | undefined): string => {
  if (!value) return "—";
  const spaced = value.replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const truncate = (value: string, max = 18): string =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;
