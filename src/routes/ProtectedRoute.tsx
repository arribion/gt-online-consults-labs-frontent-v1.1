import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FullPageLoader } from "@/components/common/States";
import { HOME_FOR_ROLE } from "@/constants/navigation";
import type { MemberRole } from "@/types";

/**
 * Client-side role checks are a routing convenience, not a security boundary —
 * every protected endpoint re-checks the role server-side. This exists so a
 * tasker who lands on an admin URL gets their own dashboard instead of a wall
 * of 403s.
 */
export function ProtectedRoute({ allowedRoles }: { allowedRoles?: MemberRole[] }) {
  const { isLoggedIn, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader label="Checking your session" />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={HOME_FOR_ROLE[role]} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
