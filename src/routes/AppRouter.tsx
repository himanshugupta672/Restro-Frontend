import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { PageLoader } from "@/components/feedback/PageLoader";
import { ROUTES } from "@/constants/routes";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { CustomerAuthLayout } from "@/layouts/CustomerAuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { CustomerProtectedRoute } from "@/routes/guards/CustomerProtectedRoute";
import { PublicOnlyRoute } from "@/routes/guards/PublicOnlyRoute";
import { RoleRoute } from "@/routes/guards/RoleRoute";
import { routeAccess } from "@/routes/routeAccess";
import { USER_ROLES } from "@/features/auth";

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

const SignUpPage = lazy(() =>
  import("@/features/auth/pages").then((module) => ({
    default: module.SignUpPage,
  }))
);

const CustomerMenuPage = lazy(() =>
  import("@/features/customerOrdering").then((module) => ({
    default: module.CustomerMenuPage,
  }))
);

const CustomerCartPage = lazy(() =>
  import("@/features/customerOrdering").then((module) => ({
    default: module.CustomerCartPage,
  }))
);

const CustomerMenuItemDetailsPage = lazy(() =>
  import("@/features/customerOrdering").then((module) => ({
    default: module.CustomerMenuItemDetailsPage,
  }))
);

const CustomerCheckoutPage = lazy(() =>
  import("@/features/customerOrdering").then((module) => ({
    default: module.CustomerCheckoutPage,
  }))
);

const OrderConfirmationPage = lazy(() =>
  import("@/features/customerOrdering").then((module) => ({
    default: module.OrderConfirmationPage,
  }))
);

const CustomerLoginPage = lazy(() =>
  import("@/features/customerOrdering/pages/CustomerLoginPage").then(
    (module) => ({
      default: module.CustomerLoginPage,
    })
  )
);

const CustomerSignUpPage = lazy(() =>
  import("@/features/customerOrdering/pages/CustomerSignUpPage").then(
    (module) => ({
      default: module.CustomerSignUpPage,
    })
  )
);

const CustomerOrderTrackingPage = lazy(() =>
  import("@/features/customerOrdering").then((module) => ({
    default: module.CustomerOrderTrackingPage,
  }))
);

const CustomerDashboardPage = lazy(() =>
  import("@/features/customerOrdering").then((module) => ({
    default: module.CustomerDashboardPage,
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

const TablesPage = lazy(() =>
  import("@/features/tables").then((module) => ({
    default: module.TablesPage,
  }))
);

const CustomersPage = lazy(() =>
  import("@/features/customers").then((module) => ({
    default: module.CustomersPage,
  }))
);

const UsersPage = lazy(() =>
  import("@/features/users").then((module) => ({
    default: module.UsersPage,
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

      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.customerMenu} element={<CustomerMenuPage />} />
        <Route
          path={ROUTES.customerMenuItemDetails}
          element={<CustomerMenuItemDetailsPage />}
        />
        <Route path={ROUTES.customerCart} element={<CustomerCartPage />} />
        <Route
          path={ROUTES.customerCheckout}
          element={<CustomerCheckoutPage />}
        />
        <Route
          path={ROUTES.customerOrderConfirmation}
          element={<OrderConfirmationPage />}
        />
        <Route
          path={ROUTES.customerOrderTracking}
          element={<CustomerOrderTrackingPage />}
        />
        {/* Protected Customer Routes */}
        <Route element={<CustomerProtectedRoute />}>
          <Route
            path={ROUTES.customerDashboard}
            element={<CustomerDashboardPage />}
          />
        </Route>
      </Route>

      <Route element={<CustomerAuthLayout />}>
        <Route path={ROUTES.customerLogin} element={<CustomerLoginPage />} />
        <Route path={ROUTES.customerSignup} element={<CustomerSignUpPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.signup} element={<SignUpPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />

          <Route element={<RoleRoute allowedRoles={routeAccess.orders} />}>
            <Route path={ROUTES.orders} element={<OrdersPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={routeAccess.menu} />}>
            <Route path={ROUTES.menu} element={<MenuPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={routeAccess.tables} />}>
            <Route path={ROUTES.tables} element={<TablesPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={routeAccess.customers} />}>
            <Route path={ROUTES.customers} element={<CustomersPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[USER_ROLES.admin]} />}>
            <Route path={ROUTES.users} element={<UsersPage />} />
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
