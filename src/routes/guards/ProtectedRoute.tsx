import { Navigate, Outlet, useLocation } from "react-router-dom";

import { PageLoader } from "@/components/feedback/PageLoader";
import { ROUTES } from "@/constants/routes";
import { selectAuthStatus } from "@/features/auth";
import { useAppSelector } from "@/hooks/reduxHooks";

export const ProtectedRoute = () => {
  const authStatus = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (authStatus === "checking") {
    return <PageLoader />;
  }

  if (authStatus !== "authenticated") {
    return <Navigate replace state={{ from: location }} to={ROUTES.login} />;
  }

  return <Outlet />;
};
