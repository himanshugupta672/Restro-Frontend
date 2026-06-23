import { Navigate, Outlet, useLocation } from "react-router-dom";

import { PageLoader } from "@/components/feedback/PageLoader";
import { ROUTES } from "@/constants/routes";
import { selectAuthStatus, selectCurrentUser, USER_ROLES } from "@/features/auth";
import { useAppSelector } from "@/hooks/reduxHooks";
import { getRedirectPath } from "@/routes/routeState";

export const PublicOnlyRoute = () => {
  const authStatus = useAppSelector(selectAuthStatus);
  const currentUser = useAppSelector(selectCurrentUser);
  const location = useLocation();

  if (authStatus === "checking") {
    return <PageLoader />;
  }

  if (authStatus === "authenticated" && currentUser) {
    const isCustomer = currentUser.role === USER_ROLES.customer;
    const fallback = isCustomer ? ROUTES.customerMenu : ROUTES.dashboard;
    const targetPath = getRedirectPath(location.state, fallback);

    // Security guard: ensure Customers do not get redirected to backend pages,
    // and staff (Admins/Chefs) do not get redirected to customer ordering portal.
    const targetIsCustomerRoute = targetPath.startsWith("/customer");

    if (isCustomer && !targetIsCustomerRoute) {
      return <Navigate replace to={ROUTES.customerMenu} />;
    }
    if (!isCustomer && targetIsCustomerRoute) {
      return <Navigate replace to={ROUTES.dashboard} />;
    }

    return (
      <Navigate
        replace
        to={targetPath}
      />
    );
  }

  return <Outlet />;
};
