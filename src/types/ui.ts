import type { ComponentType, SVGProps } from "react";
import type { MemberRole } from "./member";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export type NavLinkItem = {
  label: string;
  to: string;
  icon: IconComponent;
  /** When set, the link only renders for these roles. */
  roles?: MemberRole[];
  /** Reads a live count off the app shell's badge source (e.g. open disputes). */
  badgeKey?: "disputes";
};

export type NavSection = {
  title: string;
  items: NavLinkItem[];
};

/** One point in a chart series, after aggregation. */
export type ChartPoint = {
  label: string;
  value: number;
  [series: string]: string | number;
};

export type SelectOption = {
  value: string;
  label: string;
};
