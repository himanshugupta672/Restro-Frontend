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
import { useEffect, useMemo, useState } from "react";

import { selectCurrentUser, USER_ROLES } from "@/features/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { CustomerActivityTable } from "../components/CustomerActivityTable";
import { CustomerDetailsDialog } from "../components/CustomerDetailsDialog";
import { CustomerFilters } from "../components/CustomerFilters";
import { selectCustomersData } from "../store/customersSlice";
import { loadCustomers } from "../store/customersThunks";
import type {
  CustomerFilters as CustomerFiltersValue,
  GuestCustomerSummary,
} from "../types/customer.types";
import { filterCustomers, getCustomerMetrics } from "../utils/customerFilters";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export const CustomersPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const customersData = useAppSelector(selectCustomersData);
  const [filters, setFilters] = useState<CustomerFiltersValue>({
    search: "",
    status: "all",
  });
  const [selectedCustomer, setSelectedCustomer] =
    useState<GuestCustomerSummary | null>(null);

  useEffect(() => {
    if (!user || user.role !== USER_ROLES.admin) {
      return;
    }

    void dispatch(loadCustomers());
  }, [dispatch, user]);

  const filteredCustomers = useMemo(
    () => filterCustomers(customersData.data.customers, filters),
    [customersData.data.customers, filters]
  );
  const metrics = useMemo(
    () =>
      getCustomerMetrics(
        customersData.data.customers,
        customersData.data.orders
      ),
    [customersData.data.customers, customersData.data.orders]
  );

  if (!user || user.role !== USER_ROLES.admin) {
    return null;
  }

  const isLoading = customersData.status === "pending";
  const isInitialLoading =
    customersData.status === "idle" ||
    (isLoading && customersData.data.customers.length === 0);

  const handleRefresh = () => {
    void dispatch(loadCustomers());
  };

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
            Customer management
          </Typography>
          <Typography color="text.secondary">
            Review guest ordering activity grouped by restaurant table.
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

      {customersData.error && (
        <Alert
          action={
            <Button color="inherit" onClick={handleRefresh} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          {customersData.error.message}
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
            minHeight: 320,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary">
              Loading customer activity...
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
                xl: "repeat(5, minmax(0, 1fr))",
              },
            }}
          >
            <CustomerMetricCard
              helperText="Tables with at least one order"
              label="Served tables"
              value={metrics.servedTables}
            />
            <CustomerMetricCard
              helperText="Orders from QR checkout"
              label="Guest orders"
              value={metrics.guestOrders}
            />
            <CustomerMetricCard
              helperText="Tables with open kitchen flow"
              label="Active tables"
              value={metrics.activeTables}
            />
            <CustomerMetricCard
              helperText="Across all guest orders"
              label="Total spend"
              value={currencyFormatter.format(metrics.totalRevenue)}
            />
            <CustomerMetricCard
              helperText="Average value per order"
              label="Avg. order"
              value={currencyFormatter.format(metrics.averageOrderValue)}
            />
          </Box>

          <CustomerFilters filters={filters} onFiltersChange={setFilters} />

          <Stack spacing={0.5}>
            <Typography component="h2" variant="h6">
              Table activity
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Showing {filteredCustomers.length} of{" "}
              {customersData.data.customers.length} table records.
            </Typography>
          </Stack>

          <CustomerActivityTable
            customers={filteredCustomers}
            onView={setSelectedCustomer}
          />
        </>
      )}

      <CustomerDetailsDialog
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        open={Boolean(selectedCustomer)}
      />
    </Stack>
  );
};

interface CustomerMetricCardProps {
  helperText: string;
  label: string;
  value: number | string;
}

const CustomerMetricCard = ({
  helperText,
  label,
  value,
}: CustomerMetricCardProps) => (
  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2.5 }}>
    <Stack spacing={0.75}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography component="p" sx={{ fontWeight: 700 }} variant="h4">
        {value}
      </Typography>
      <Typography color="text.secondary" variant="caption">
        {helperText}
      </Typography>
    </Stack>
  </Paper>
);
