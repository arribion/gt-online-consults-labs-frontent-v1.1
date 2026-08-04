// src/components/admin/QuickActions.tsx
import { Link } from "react-router-dom";
import {
  UserPlus,
  FolderPlus,
  UploadCloud,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  Bug,
} from "lucide-react";

type Action = {
  id: number;
  label: string;
  to: string;
  icon: any;
  variant?: "primary" | "accent" | "ghost";
  external?: boolean;
};

const ACTIONS: Action[] = [
  {
    id: 1,
    label: "Create new Member",
    to: "/admin/members",
    icon: UserPlus,
    variant: "primary",
  },
  {
    id: 2,
    label: "Add New Project",
    to: "/admin/projects",
    icon: FolderPlus,
    variant: "primary",
  },
  {
    id: 3,
    label: "Upload Resource",
    to: "/admin/resources",
    icon: UploadCloud,
    variant: "accent",
  },
  {
    id: 4,
    label: "Review Pending Payments",
    to: "/admin/payments/pending",
    icon: FileText,
    variant: "ghost",
  },
  {
    id: 5,
    label: "Google Form",
    to: "https://docs.google.com/forms/d/e/1FAIpQLSfE3VTctziQDu15Odjr12wgCL6_-B3cfKQJjWuW2BvE5avB-A/closedform",
    icon: ExternalLink,
    variant: "ghost",
    external: true,
  },
  {
    id: 6,
    label: "Google Calendar",
    to: "https://calendar.google.com/calendar/u/0/r?cid=ZjI2MmQwYTExZTE4MzY5ZTIxMzA2MTBmMWUxOTRlNGNlYTYyYzA4ODM0NTExMmIyMTM0MWZiNTE0MDIzNTY2OUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
    icon: Calendar,
    variant: "ghost",
    external: true,
  },
];

const variantClasses = {
  primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-300",
  accent:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300",
  ghost:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-sky-200",
};

const QuickActions = ({ compact = false }: { compact?: boolean }) => {
  return (
    <aside
      className={`rounded-2xl border border-gray-200 bg-linear-to-br from-white to-slate-50 p-6 shadow-md ${
        compact ? "max-w-56" : "max-w-[18rem]"
      }`}
      aria-labelledby="quick-actions-title">
      <div className="flex items-start justify-between">
        <div>
          <h2
            id="quick-actions-title"
            className="text-lg font-semibold text-sky-700">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Common admin tasks at a glance
          </p>
        </div>

        <div className="ml-3 flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md bg-white/60 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
            aria-label="Refresh quick actions"
            title="Refresh">
            <ChevronRight size={14} className="transform rotate-90" />
            <span className="sr-only">Refresh</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const classes = variantClasses[a.variant ?? "primary"];
          const content = (
            <div
              className={`flex w-full items-center justify-between gap-3 ${classes} rounded-lg px-3 py-2 transition-shadow focus:outline-none focus:ring-2`}>
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-white/20 p-2">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold">{a.label}</span>
              </div>
              <div className="text-xs text-white/90">
                {a.external ? (
                  <ExternalLink size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
            </div>
          );

          return a.external ? (
            <a
              key={a.id}
              href={a.to}
              target="_blank"
              rel="noreferrer"
              className="block"
              aria-label={`${a.label} (opens in new tab)`}>
              {content}
            </a>
          ) : (
            <Link key={a.id} to={a.to} className="block" aria-label={a.label}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <a
          href="https://wa.me/254707468863?text=I would like to report a bug/suggetion in the qt-online application."
          target="_blank"
          className="block">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Create member login">
            <Bug size={16} />
            REPORT A BUG
          </button>
        </a>
      </div>
    </aside>
  );
};

export default QuickActions;
