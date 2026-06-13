import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { selectCurrentUser, type UserRole } from "@/features/auth";
import { useAppSelector } from "@/hooks/reduxHooks";

interface RoleRouteProps {
  allowedRoles: readonly UserRole[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const user = useAppSelector(selectCurrentUser);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate replace to={ROUTES.unauthorized} />;
  }

  return <Outlet />;
};
