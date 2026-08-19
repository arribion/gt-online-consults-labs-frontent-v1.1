import {
  AlertTriangle,
  BookOpen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import type { NavSection } from "@/types";

/**
 * Nav is grouped by what the person is trying to do, not by which router file
 * happens to serve it. Both roles share the same shell, so both lists have the
 * same shape.
 */
export const TASKER_NAV: NavSection[] = [
  {
    title: "Work",
    items: [
      { label: "Dashboard", to: "/client/dashboard", icon: LayoutDashboard },
      { label: "My tasks", to: "/client/tasks", icon: ListChecks },
      { label: "Log tasks", to: "/client/log", icon: Upload },
      { label: "Disputes", to: "/client/disputes", icon: AlertTriangle, badgeKey: "disputes" },
    ],
  },
  {
    title: "Money & projects",
    items: [
      { label: "Invoices", to: "/client/invoices", icon: Receipt },
      { label: "Projects", to: "/client/projects", icon: FolderKanban },
      { label: "Resources", to: "/client/resources", icon: BookOpen },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", to: "/client/settings", icon: Settings }],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Projects", to: "/admin/projects", icon: FolderKanban },
      { label: "Members", to: "/admin/members", icon: Users },
      { label: "Task log", to: "/admin/tasks", icon: ListChecks },
      { label: "Disputes", to: "/admin/disputes", icon: AlertTriangle, badgeKey: "disputes" },
    ],
  },
  {
    title: "Billing & files",
    items: [
      { label: "Invoicing", to: "/admin/invoices", icon: FileText },
      { label: "Resources", to: "/admin/resources", icon: BookOpen },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", to: "/admin/settings", icon: Settings }],
  },
];

/** Where each role lands after signing in. */
export const HOME_FOR_ROLE = {
  TASKER: "/client/dashboard",
  ADMIN: "/admin",
  SUPERADMIN: "/admin",
} as const;
