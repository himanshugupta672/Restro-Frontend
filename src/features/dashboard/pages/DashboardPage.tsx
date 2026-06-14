import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect } from "react";

import { selectCurrentUser, USER_ROLES } from "@/features/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { DashboardMetricCard } from "../components/DashboardMetricCard";
import { OrderStatusOverview } from "../components/OrderStatusOverview";
import { RecentOrdersTable } from "../components/RecentOrdersTable";
import { selectDashboardOverview } from "../store/dashboardSlice";
import { loadDashboard } from "../store/dashboardThunks";
import {
  getDashboardMetrics,
  getOrderStatusCounts,
  getRecentOrders,
} from "../utils/dashboardMetrics";

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const overview = useAppSelector(selectDashboardOverview);
  const isLoading = overview.status === "pending";
  const isInitialLoading =
    !overview.data &&
    (overview.status === "idle" || overview.status === "pending");

  useEffect(() => {
    if (!user) {
      return;
    }

    void dispatch(loadDashboard(user.role));
  }, [dispatch, user]);

  if (!user) {
    return null;
  }

  const handleRefresh = () => {
    void dispatch(loadDashboard(user.role));
  };

  const metrics = overview.data
    ? getDashboardMetrics(overview.data, user.role)
    : [];
  const statusCounts = overview.data ? getOrderStatusCounts(overview.data) : [];
  const recentOrders = overview.data ? getRecentOrders(overview.data) : [];
  const showsOrderData = user.role !== USER_ROLES.customer;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h4">
            Dashboard
          </Typography>
          <Typography color="text.secondary">
            Welcome back. Here is the latest restaurant overview.
          </Typography>
        </Stack>
        <Button
          disabled={isLoading}
          onClick={handleRefresh}
          startIcon={
            isLoading ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <RefreshOutlinedIcon />
            )
          }
          variant="outlined"
        >
          Refresh
        </Button>
      </Stack>

      {overview.error && (
        <Alert
          action={
            <Button color="inherit" onClick={handleRefresh} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          {overview.error.message}
        </Alert>
      )}

      {isInitialLoading ? (
        <Paper
          elevation={0}
          sx={{
            alignItems: "center",
            border: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            minHeight: 280,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary">
              Loading dashboard data...
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: `repeat(${Math.min(metrics.length, 5)}, minmax(0, 1fr))`,
              },
            }}
          >
            {metrics.map((metric) => (
              <DashboardMetricCard key={metric.label} metric={metric} />
            ))}
          </Box>

          {showsOrderData && (
            <Box
              sx={{
                alignItems: "start",
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  xl: "minmax(280px, 0.35fr) minmax(0, 0.65fr)",
                },
              }}
            >
              <OrderStatusOverview statusCounts={statusCounts} />
              <RecentOrdersTable orders={recentOrders} />
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};
