import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";

type ProtectedRouteProps = {
  allowedRoles?: ("TASKER" | "ADMIN")[];
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isLoggedIn, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      toast.error("Please log in to view this page.");
    } else if (
      !isLoading &&
      isLoggedIn &&
      allowedRoles &&
      user &&
      !allowedRoles.includes(user.role as "TASKER" | "ADMIN")
    ) {
      toast.error("Unauthorized access.");
    }
  }, [isLoggedIn, isLoading, allowedRoles, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-[15em]">
        <Oval
          height={80}
          width={80}
          color="#0EA5E9"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="#4fa94d"
          strokeWidth={2}
          strokeWidthSecondary={2}
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to  respective dashboards if they land on the wrong route
    return (
      <Navigate
        to={user.role === "ADMIN" ? "/admin" : "/client/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};
