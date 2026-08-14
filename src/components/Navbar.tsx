import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LayoutDashboard, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import gt_logo from "../assets/gt-logo.png";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { to: "/", label: "Home", icon: null },
  { to: "/about", label: "About", icon: LayoutDashboard },
  { to: "/contact-us", label: "Contact Us", icon: ArrowLeftRight },
] as const;

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  // Extract the first letter of the email and uppercase it
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "";

  // Dynamic dashboard routing logic based on user role
  const getDashboardPath = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "ADMIN":
        return "/admin/";
      case "TASKER":
      default:
        return "/client/dashboard";
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-slate-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={gt_logo} alt="" className="max-w-[4em]" />
          <span className="text-2xl text-blue-500 font-bold tracking-tight">
            <span className="text-gray-500">GT</span> -ONLINE
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={
                  location.pathname === link.to ||
                  location.pathname.startsWith(link.to)
                    ? "secondary"
                    : "ghost"
                }
                size="sm">
                {link.label}
              </Button>
            </Link>
          ))}

          {/* Conditional authentication desktop view */}
          {!user ? (
            <div>
              <div className="hidden md:flex gap-3">
                <Link to="/login">
                    <button className="px-4 py-2 hover:bg-sky-500 hover:text-white rounded-md border border-sky-600 text-sky-600 duration-500 transition">
                      Sign in
                    </button>
                </Link>
                <button className="px-4 py-2 hover:bg-sky-500 hover:text-white rounded-md bg-sky-600 text-white">
                  Request Registration
                </button>
                </div>
            </div>
          ) : (
            <Link to={dashboardPath} className="flex items-center gap-3 ml-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm shadow-sm transition-transform hover:scale-105">
                {userInitial}
              </button>
            </Link>
          )}
        </div>

        <button
          className="flex items-center justify-center rounded-lg p-2 text-foreground md:hidden hover:bg-accent"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
           
            {/* Conditional authentication mobile view */}
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link
                  to="/client/dashboard"
                  onClick={() => setMobileOpen(false)}>
                  <Button variant="hero" className="w-full mt-2">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <Link
                to={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 border-t mt-2 hover:bg-slate-100 rounded-md">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm">
                  {userInitial}
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-400 capitalize">
                    {user.role || "Client"} Dashboard
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}