import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { Logo } from "./ui";
import { useAuth } from "../../hooks/useAuth";
import { HOME_FOR_ROLE } from "../../constants/navigation";

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
  // Someone already signed in gets sent straight to their workspace rather
  // than through the login form again.
  const { isLoggedIn, role } = useAuth();
  const workspace = role ? HOME_FOR_ROLE[role] : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "nav-blur border-b border-line/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]" : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l, _index) => (
            <a
              key={l.label}
              href={l.href}
              className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-frost">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded bg-sky2 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="#pricing" className="text-sm font-semibold text-mist transition-colors hover:text-frost">
            Hire Talents
          </a>
          {isLoggedIn ? (
            <Link
              to={workspace}
              className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-azure to-[#1873e0] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(47,157,255,0.7)] transition-transform hover:-translate-y-0.5"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              My workspace
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line2/70 px-4 py-2 text-sm font-semibold text-frost transition-colors hover:border-azure/60 hover:text-sky2"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-frost lg:hidden"
          aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {/* mobile menu */}
      <div
        className={`overflow-hidden border-b border-line/70 bg-deep/95 backdrop-blur transition-all duration-300 lg:hidden ${open ? "max-h-96" : "max-h-0"
          }`}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {links.map((l, _index) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-mist hover:bg-panel hover:text-frost">
              {l.label}
            </a>
          ))}
          <Link
            to={workspace}
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-line2/70 px-4 py-2.5 text-sm font-semibold text-frost"
          >
            {isLoggedIn ? (
              <>
                <LayoutDashboard className="h-4 w-4" /> My workspace
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign in
              </>
            )}
          </Link>
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-azure px-4 py-2.5 text-sm font-semibold text-white"
          >
            Join Talent Network <ArrowRight className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}