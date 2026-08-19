import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { HOME_FOR_ROLE } from "@/constants/navigation";

export default function NotFound() {
  const { role } = useAuth();

  return (
    <div className="relative grid min-h-screen place-items-center px-5">
      <div className="ambient" />
      <div className="w-full max-w-md rounded-2xl border border-line2/60 bg-panel/90 p-8 text-center shadow-card-hover backdrop-blur">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-line2/70 bg-ink2 text-sky2">
          <Compass className="h-5 w-5" />
        </span>
        <p className="mt-5 font-display text-5xl font-bold tracking-tight text-frost">404</p>
        <h1 className="mt-2 font-display text-lg font-semibold text-frost">Page not found</h1>
        <p className="mt-2 text-sm text-mist">
          That address doesn't exist. It may have moved, or the link that brought you here is out of
          date.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
          {role && (
            <Button asChild>
              <Link to={HOME_FOR_ROLE[role]}>Go to my dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
