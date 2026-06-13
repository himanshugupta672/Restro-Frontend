import { Navigate, Outlet, useLocation } from "react-router-dom";

import { PageLoader } from "@/components/feedback/PageLoader";
import { ROUTES } from "@/constants/routes";
import { selectAuthStatus } from "@/features/auth";
import { useAppSelector } from "@/hooks/reduxHooks";
import { getRedirectPath } from "@/routes/routeState";

export const PublicOnlyRoute = () => {
  const authStatus = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (authStatus === "checking") {
    return <PageLoader />;
  }

  if (authStatus === "authenticated") {
    return (
      <Navigate
        replace
        to={getRedirectPath(location.state, ROUTES.dashboard)}
      />
    );
  }

  return <Outlet />;
};
