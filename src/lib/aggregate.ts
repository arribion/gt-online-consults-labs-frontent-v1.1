/** Small aggregation helpers shared by the dashboards, so both roles count the same way. */

/** Sum `value` per `key`, dropping entries with no key. */
export function sumBy<T>(
  items: T[],
  key: (item: T) => string | null | undefined,
  value: (item: T) => number,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const item of items) {
    const group = key(item);
    if (!group) continue;
    totals.set(group, (totals.get(group) ?? 0) + value(item));
  }
  return totals;
}

export function countBy<T>(items: T[], key: (item: T) => string | null | undefined) {
  return sumBy(items, key, () => 1);
}

const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * A dense daily series over the last `days` days — days with no activity are
 * present with a zero, so the trend line shows the gaps rather than closing
 * over them.
 */
export function dailySeries<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getValue: (item: T) => number,
  days = 30,
): { label: string; value: number }[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.set(dayKey(date), 0);
  }

  for (const item of items) {
    const raw = getDate(item);
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + getValue(item));
  }

  return [...buckets.entries()].map(([key, value]) => ({
    label: new Date(key).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    value,
  }));
}

/** Turn a `Map` of totals into the shape the ranked bar chart expects. */
export function toRanked(
  totals: Map<string, number>,
  resolveLabel: (key: string) => string,
): { key: string; label: string; value: number }[] {
  return [...totals.entries()]
    .map(([key, value]) => ({ key, label: resolveLabel(key), value }))
    .sort((a, b) => b.value - a.value);
}

/** Inclusive ISO date range for the last `days` days, ready for a date filter. */
export function lastDays(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}
