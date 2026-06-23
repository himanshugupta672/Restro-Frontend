import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";

import { PageLoader } from "@/components/feedback/PageLoader";
import { ROUTES } from "@/constants/routes";
import { selectAuthStatus, selectCurrentUser, USER_ROLES } from "@/features/auth";
import { useAppSelector } from "@/hooks/reduxHooks";

export const CustomerProtectedRoute = () => {
  const authStatus = useAppSelector(selectAuthStatus);
  const currentUser = useAppSelector(selectCurrentUser);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("table");

  if (authStatus === "checking") {
    return <PageLoader />;
  }

  if (
    authStatus !== "authenticated" ||
    !currentUser ||
    currentUser.role !== USER_ROLES.customer
  ) {
    const loginUrl = table
      ? `${ROUTES.customerLogin}?table=${table}`
      : ROUTES.customerLogin;
    return <Navigate replace state={{ from: location }} to={loginUrl} />;
  }

  return <Outlet />;
};
