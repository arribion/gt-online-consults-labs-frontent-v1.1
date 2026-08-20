import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartFrame, ChartTooltip, type LegendEntry } from "./ChartFrame";
import { AXIS_COLOR, GRID_COLOR, SURFACE, axisProps, seriesColor } from "./theme";
import { EmptyState } from "../States";

type Formatter = (value: number) => string;

const defaultFormat: Formatter = (value) => value.toLocaleString("en-US");

function NoData({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center">
      <EmptyState title="Nothing to chart yet" description={label} />
    </div>
  );
}

/**
 * Change over time. Area rather than bars because the reader is following a
 * shape, not comparing discrete magnitudes; a crosshair tooltip reads every
 * series at the hovered date at once.
 */
type TrendRow = Record<string, string | number>;

export function TrendChart({
  title,
  description,
  data,
  xKey,
  series,
  height = 260,
  format = defaultFormat,
  emptyLabel = "Log some tasks and this fills in.",
  className,
}: {
  title: string;
  description?: string;
  data: TrendRow[];
  xKey: string;
  series: { key: string; label: string }[];
  height?: number;
  format?: Formatter;
  emptyLabel?: string;
  className?: string;
}) {
  const legend: LegendEntry[] = series.map((entry, index) => ({
    label: entry.label,
    color: seriesColor(index),
  }));

  const table = {
    columns: [title, ...series.map((entry) => entry.label)],
    rows: data.map((row) => [
      String(row[xKey]),
      ...series.map((entry) => format(Number(row[entry.key] ?? 0))),
    ]),
  };

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={legend}
      height={height}
      className={className}
      table={data.length ? table : undefined}
    >
      {!data.length ? (
        <NoData label={emptyLabel} />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              {series.map((entry, index) => (
                <linearGradient
                  key={entry.key}
                  id={`fill-${title.replace(/\W/g, "")}-${entry.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={seriesColor(index)} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={seriesColor(index)} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey={xKey} {...axisProps} minTickGap={24} />
            <YAxis {...axisProps} width={52} tickFormatter={(value) => format(Number(value))} />
            <Tooltip
              cursor={{ stroke: AXIS_COLOR, strokeWidth: 1, strokeDasharray: "4 4" }}
              content={({ active, label, payload }) => (
                <ChartTooltip
                  active={active}
                  label={label as string}
                  items={(payload ?? []).map((item) => ({
                    name: String(item.name),
                    value: format(Number(item.value ?? 0)),
                    color: String(item.color),
                  }))}
                />
              )}
            />
            {series.map((entry, index) => (
              <Area
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={seriesColor(index)}
                strokeWidth={2}
                fill={`url(#fill-${title.replace(/\W/g, "")}-${entry.key})`}
                activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

/**
 * Ranked magnitude. Horizontal, because category labels are names and names
 * need room — a vertical bar chart would rotate them to 45°.
 */
export function RankedBarChart({
  title,
  description,
  data,
  height = 260,
  format = defaultFormat,
  emptyLabel = "No activity in this range.",
  action,
  className,
}: {
  title: string;
  description?: string;
  data: { label: string; value: number; color?: string }[];
  height?: number;
  format?: Formatter;
  emptyLabel?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const table = {
    columns: ["Name", "Value"],
    rows: data.map((row) => [row.label, format(row.value)]),
  };

  return (
    <ChartFrame
      title={title}
      description={description}
      height={height}
      className={className}
      table={data.length ? table : undefined}
      action={action}
    >
      {!data.length ? (
        <NoData label={emptyLabel} />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 44, bottom: 4, left: 4 }}
            barCategoryGap="22%"
          >
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 5" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              {...axisProps}
              tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(47,157,255,0.07)" }}
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  label={payload?.[0]?.payload?.label}
                  items={(payload ?? []).map((item) => ({
                    name: title,
                    value: format(Number(item.value ?? 0)),
                    color: item.payload?.color ?? seriesColor(0),
                  }))}
                />
              )}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
              {data.map((row, index) => (
                <Cell key={row.label} fill={row.color ?? seriesColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

/**
 * Composition of a whole. Kept to a handful of slices with a headline total in
 * the middle — the number people actually want is the total, and the ring shows
 * how it splits.
 */
export function DonutChart({
  title,
  description,
  data,
  total,
  totalLabel,
  height = 260,
  format = defaultFormat,
  emptyLabel = "Nothing recorded in this range.",
  className,
}: {
  title: string;
  description?: string;
  data: { label: string; value: number; color?: string }[];
  total?: string;
  totalLabel?: string;
  height?: number;
  format?: Formatter;
  emptyLabel?: string;
  className?: string;
}) {
  const sum = data.reduce((accumulator, row) => accumulator + row.value, 0);
  const legend: LegendEntry[] = data.map((row, index) => ({
    label: row.label,
    color: row.color ?? seriesColor(index),
    value: sum ? `${Math.round((row.value / sum) * 100)}%` : undefined,
  }));

  const table = {
    columns: ["Category", "Value", "Share"],
    rows: data.map((row) => [
      row.label,
      format(row.value),
      sum ? `${Math.round((row.value / sum) * 100)}%` : "0%",
    ]),
  };

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={legend}
      height={height}
      className={className}
      table={data.length ? table : undefined}
    >
      {!data.length ? (
        <NoData label={emptyLabel} />
      ) : (
        <div className="relative h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => (
                  <ChartTooltip
                    active={active}
                    items={(payload ?? []).map((item) => ({
                      name: String(item.name),
                      value: format(Number(item.value ?? 0)),
                      color: item.payload?.color ?? seriesColor(0),
                    }))}
                  />
                )}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                stroke={SURFACE}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((row, index) => (
                  <Cell key={row.label} fill={row.color ?? seriesColor(index)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="font-display text-2xl font-bold tabular-nums text-frost">
                {total ?? format(sum)}
              </p>
              {totalLabel && <p className="text-[11px] text-dim">{totalLabel}</p>}
            </div>
          </div>
        </div>
      )}
    </ChartFrame>
  );
}
