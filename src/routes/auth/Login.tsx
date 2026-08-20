import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/common/States";
import { HOME_FOR_ROLE } from "@/constants/navigation";
import logo from "@/assets/gt-logo.png";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HIGHLIGHTS = [
  "Log tasks in bulk or one at a time, with the caps applied for you",
  "See a disputed task the moment it's raised against your work",
  "Generate an invoice for any project and period, priced automatically",
];

export default function Login() {
  const { login, isLoggedIn, isLoading, isSubmitting, role } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Sign in · GT Online Consults";
  }, []);

  if (isLoading) return <FullPageLoader label="Checking your session" />;

  if (isLoggedIn && role) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? HOME_FOR_ROLE[role]} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setError("");
    // Nothing to do on success — the guard above re-runs with a session and
    // redirects to the role's home (or wherever the user was headed).
    await login(trimmedEmail, password);
  };

  return (
    <div className="relative min-h-screen">
      <div className="ambient" />

      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* the pitch — hidden on phones, where the form is the whole job */}
        <section className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-line2/70 bg-panel/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky2">
            <Sparkles className="h-3.5 w-3.5" /> Talent workspace
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-frost">
            Your task log, disputes and invoices — <span className="text-shimmer">in one place</span>
          </h1>
          <p className="mt-4 max-w-md text-mist">
            Sign in to log completed work, track what you're owed, and download invoices the moment a
            period closes.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-sm text-frost/90">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-line2/60 bg-ink2 text-sky2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        {/* the form */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-line2/60 bg-panel/90 p-6 shadow-card-hover backdrop-blur sm:p-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-azure to-[#eff3f9]">
                <img src={logo} alt="" className="max-w-[1.7em]" />
              </span>
              <span className="font-display text-sm font-bold tracking-tight text-frost">
                GT. <span className="text-sky2">ONLINECONSULTS</span>
              </span>
            </Link>

            <h2 className="mt-6 font-display text-2xl font-bold text-frost">Welcome back</h2>
            <p className="mt-1.5 text-sm text-mist">
              Accounts are created by an administrator — there's no public sign-up.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad"
                >
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-mist">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value.trimStart())}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-line bg-ink2/70 py-3 pl-10 pr-3 text-sm text-frost placeholder:text-dim focus:border-azure focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-mist">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-line bg-ink2/70 py-3 pl-10 pr-11 text-sm text-frost placeholder:text-dim focus:border-azure focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-dim transition-colors hover:text-frost"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : "Sign in"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-dim">
              Need an account? Ask your administrator to add you, then sign in here.
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-dim">
            <Link to="/" className="transition-colors hover:text-sky2">
              ← Back to gtonlineconsults.com
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
