import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
function NotFoundComponent() {
  const navigate = useNavigate();

  const returnPrev = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-sky-500">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex flex-col gap-2 justify-center sm:flex-row">
          <button
            onClick={returnPrev}
            className=" flex gap-3  items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-sky-600">
            <ArrowLeft size={15} />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundComponent;
