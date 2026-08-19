/**
 * Shared chart parameters.
 *
 * The categorical order is fixed and never cycled: a sixth series folds into
 * "Other" rather than borrowing slot 1's hue back. These five steps were
 * validated against the #0a1e3a card surface (lightness band, chroma floor,
 * adjacent-pair CVD separation, normal-vision floor, contrast) — re-step them
 * with the validator, never by eye.
 */
export const SERIES_COLORS = [
  "#1f7fd6",
  "#c67f22",
  "#17a07c",
  "#7b6ae0",
  "#3499b8",
] as const;

/** Anything past the fifth slot is aggregated under this label and colour. */
export const OTHER_COLOR = "#5a6f8c";
export const OTHER_LABEL = "Other";

/** Single-hue ramp for magnitude. Dim → bright, because the surface is dark. */
export const SEQUENTIAL_COLORS = [
  "#123f6b",
  "#1a5c9e",
  "#1f7fd6",
  "#4f9fe4",
  "#86c1ef",
] as const;

/** Status colours are reserved — never reused as a series. */
export const STATUS_COLORS = {
  good: "#1fae74",
  warn: "#d9a01f",
  bad: "#e0524f",
  neutral: "#5a6f8c",
} as const;

export const seriesColor = (index: number): string =>
  index < SERIES_COLORS.length ? SERIES_COLORS[index] : OTHER_COLOR;

export const GRID_COLOR = "#173253";
export const AXIS_COLOR = "#647fa0";
export const SURFACE = "#0a1e3a";

/** Recessive axes: no axis line, no ticks, small muted labels. */
export const axisProps = {
  stroke: AXIS_COLOR,
  tickLine: false,
  axisLine: false,
  tick: { fill: AXIS_COLOR, fontSize: 11 },
} as const;

/**
 * Fold a ranked list down to the five categorical slots plus an "Other" bucket,
 * so a chart never has to invent a sixth hue.
 */
export function foldToSeries<T>(
  items: T[],
  getValue: (item: T) => number,
  getLabel: (item: T) => string,
  max = SERIES_COLORS.length,
): { label: string; value: number; color: string }[] {
  const sorted = [...items].sort((a, b) => getValue(b) - getValue(a));
  const head = sorted.slice(0, max).map((item, index) => ({
    label: getLabel(item),
    value: getValue(item),
    color: seriesColor(index),
  }));
  const tail = sorted.slice(max);
  if (tail.length) {
    head.push({
      label: `${OTHER_LABEL} (${tail.length})`,
      value: tail.reduce((sum, item) => sum + getValue(item), 0),
      color: OTHER_COLOR,
    });
  }
  return head.filter((entry) => entry.value > 0);
}
