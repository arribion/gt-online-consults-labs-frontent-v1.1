import type { ComponentType } from "react";

export type StatItem = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: ComponentType<any>;
  accent: string;
};

export type PaymentItem = {
  id: string;
  name: string;
  project: string;
  amount: string;
  status: "Paid" | "Pending" | string;
  date: string;
};