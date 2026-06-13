import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { PageLoader } from "@/components/feedback/PageLoader";
import { ROUTES } from "@/constants/routes";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { PublicOnlyRoute } from "@/routes/guards/PublicOnlyRoute";
import { RoleRoute } from "@/routes/guards/RoleRoute";
import { routeAccess } from "@/routes/routeAccess";

const WelcomePage = lazy(() =>
  import("@/pages/WelcomePage").then((module) => ({
    default: module.WelcomePage,
  }))
);

const LoginPage = lazy(() =>
  import("@/features/auth/pages").then((module) => ({
    default: module.LoginPage,
  }))
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard").then((module) => ({
    default: module.DashboardPage,
  }))
);

const MenuPage = lazy(() =>
  import("@/features/menu").then((module) => ({
    default: module.MenuPage,
  }))
);

const OrdersPage = lazy(() =>
  import("@/features/orders").then((module) => ({
    default: module.OrdersPage,
  }))
);

const CustomersPage = lazy(() =>
  import("@/features/customers").then((module) => ({
    default: module.CustomersPage,
  }))
);

const ReportsPage = lazy(() =>
  import("@/features/reports").then((module) => ({
    default: module.ReportsPage,
  }))
);

const UnauthorizedPage = lazy(() =>
  import("@/pages/errors/UnauthorizedPage").then((module) => ({
    default: module.UnauthorizedPage,
  }))
);

const NotFoundPage = lazy(() =>
  import("@/pages/errors/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  }))
);

export const AppRouter = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path={ROUTES.home} element={<WelcomePage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.orders} element={<OrdersPage />} />

          <Route element={<RoleRoute allowedRoles={routeAccess.menu} />}>
            <Route path={ROUTES.menu} element={<MenuPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={routeAccess.customers} />}>
            <Route path={ROUTES.customers} element={<CustomersPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={routeAccess.reports} />}>
            <Route path={ROUTES.reports} element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
