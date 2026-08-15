import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Logo } from "./ui";

const links = [
  { label: "For Talents", href: "#features" },
  { label: "For Companies", href: "#features" },
  { label: "Resources", href: "#how" },
  { label: "Our Process", href: "#workflow" },
  { label: "About Us", href: "#pricing" },
  { label: "Talent Solutions", href: "#testimonials" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "nav-blur border-b border-line/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]"
          : "bg-transparent"
      }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l, index) => (
            <a
              key={`${l.href}-${index}`}
              href={l.href}
              className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-frost">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded bg-sky2 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop Auth Section */}
        {!user ? (
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="/register"
              className="text-sm border border-slate-500 font-semibold text-mist transition-colors hover:text-frost px-3 py-1.5 rounded-md">
              Hire Talents
            </a>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-azure to-[#1873e0] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(47,157,255,0.7)] transition-transform hover:-translate-y-0.5">
              Join Talent Network
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : (
          <Link
            to={dashboardPath}
            className="hidden lg:flex items-center gap-3 ml-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm shadow-sm transition-transform hover:scale-105">
              {userInitial}
            </button>
          </Link>
        )}

        {/* Mobile Hamburguer Action button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-frost lg:hidden"
          aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`overflow-hidden border-b border-line/70 bg-deep/95 backdrop-blur transition-all duration-300 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}>
        <nav className="flex flex-col gap-1 px-5 py-4">
          {links.map((l, index) => (
            <a
              key={`mobile-${l.href}-${index}`}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-mist hover:bg-panel hover:text-frost">
              {l.label}
            </a>
          ))}

          {/* Conditional authentication mobile view */}
          {!user ? (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-azure px-4 py-2.5 text-sm font-semibold text-white">
              Sign up free <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to={dashboardPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 border-t border-line/50 mt-2 hover:bg-panel rounded-md">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm loop-avatar">
                {userInitial}
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-frost capitalize">
                  {user.role ? user.role.toLowerCase() : "Client"} Dashboard
                </span>
              </div>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}