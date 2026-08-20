import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import logo from "@/assets/gt-logo.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useOpenDisputeCount } from "@/hooks/useOpenDisputeCount";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CountPill } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ADMIN_NAV, TASKER_NAV } from "@/constants/navigation";
import type { NavSection } from "@/types";

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg px-1 py-1"
      aria-label="GT Online Consults home"
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-azure to-[#eff3f9] shadow-[0_8px_24px_-8px_rgba(47,157,255,0.7)]">
        <img src={logo} alt="" className="max-w-[1.6em]" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber shadow-[0_0_10px_rgba(255,180,84,0.9)]" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display text-sm font-bold tracking-tight text-frost">
          GT. <span className="text-sky2">ONLINECONSULTS</span>
        </span>
        <span className="block text-[9px] uppercase tracking-[0.2em] text-dim">
          AI &amp; Technology
        </span>
      </span>
    </Link>
  );
}

function SidebarNav({
  sections,
  disputeCount,
  onNavigate,
}: {
  sections: NavSection[];
  disputeCount: number;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-dim">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-azure/15 font-semibold text-sky2"
                        : "text-mist hover:bg-panel2/70 hover:text-frost",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badgeKey === "disputes" && (
                    <CountPill count={disputeCount} tone="warn" className="ml-auto" />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (!user) return null;
  const settingsPath = user.role === "TASKER" ? "/client/settings" : "/admin/settings";

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-line/70 bg-ink2/60 py-1.5 pl-1.5 pr-2 transition-colors hover:border-azure/40"
      >
        <UserAvatar name={user.full_name} src={user.avatar} size="sm" />
        <span className="hidden min-w-0 text-left lg:block">
          <span className="block truncate text-xs font-semibold text-frost">{user.full_name}</span>
          <span className="block text-[10px] text-dim">{user.role}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-mist" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-popover shadow-card-hover"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-frost">{user.full_name}</p>
            <p className="truncate text-xs text-mist">{user.email}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-sky2">
              <ShieldCheck className="h-3 w-3" /> {user.role}
            </p>
          </div>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate(settingsPath);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-mist transition-colors hover:bg-ink2 hover:text-frost"
          >
            <User className="h-4 w-4" /> Profile &amp; settings
          </button>
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate("/login", { replace: true });
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-bad transition-colors hover:bg-bad/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The shell both roles share.
 *
 * Mobile-first: the sidebar is an off-canvas drawer up to `lg`, where it
 * becomes a fixed rail. Nothing about the page depends on a hard-coded content
 * offset — the rail is a flex sibling, so the main column simply takes the
 * remaining width at any viewport size.
 */
export function AppShell({ variant }: { variant: "tasker" | "admin" }) {
  const sections = variant === "admin" ? ADMIN_NAV : TASKER_NAV;
  const disputeCount = useOpenDisputeCount();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Any navigation closes the drawer — otherwise it stays over the new page.
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen">
      <div className="ambient-app" />

      <div className="flex min-h-screen">
        {/* rail: drawer below lg, fixed column from lg up */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[268px] max-w-[85vw] flex-col border-r border-line bg-ink2/95 backdrop-blur transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5">
            <Brand onNavigate={() => setDrawerOpen(false)} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-lg text-mist hover:bg-panel2 hover:text-frost lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <SidebarNav
            sections={sections}
            disputeCount={disputeCount}
            onNavigate={() => setDrawerOpen(false)}
          />

          <div className="border-t border-line px-4 py-3">
            <p className="text-[10px] text-dim">
              {variant === "admin" ? "Admin workspace" : "Tasker workspace"}
            </p>
          </div>
        </aside>

        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-deep/70 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-line/80 bg-ink/85 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-frost lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="lg:hidden">
                <Brand />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
                <AccountMenu />
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
