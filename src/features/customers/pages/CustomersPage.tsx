import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { selectCurrentUser, USER_ROLES } from "@/features/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { normalizeApiError } from "@/services/api";
import { notificationEnqueued } from "@/store/appStatus";

import { CustomerActivityTable } from "../components/CustomerActivityTable";
import { CustomerDetailsDialog } from "../components/CustomerDetailsDialog";
import { CustomerFilters } from "../components/CustomerFilters";
import { RegisteredCustomersTable } from "../components/RegisteredCustomersTable";
import { RegisteredCustomerDetailsDialog } from "../components/RegisteredCustomerDetailsDialog";
import { RegisteredCustomerEditDialog } from "../components/RegisteredCustomerEditDialog";
import { selectCustomersData } from "../store/customersSlice";
import { loadCustomers } from "../store/customersThunks";
import {
  getRegisteredCustomers,
  toggleCustomerActiveStatus,
  updateCustomerProfile,
} from "../api/adminCustomersApi";
import type {
  CustomerFilters as CustomerFiltersValue,
  GuestCustomerSummary,
} from "../types/customer.types";
import type { RegisteredCustomer, EditCustomerInput } from "../types/adminCustomers.types";
import { filterCustomers, getCustomerMetrics } from "../utils/customerFilters";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

export const CustomersPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const customersData = useAppSelector(selectCustomersData);

  // Tab State: 0 = Registered Accounts, 1 = Table Activity
  const [activeTab, setActiveTab] = useState<number>(0);

  // Registered Customers State
  const [registeredCustomers, setRegisteredCustomers] = useState<RegisteredCustomer[]>([]);
  const [registeredLoading, setRegisteredLoading] = useState<boolean>(true);
  const [registeredError, setRegisteredError] = useState<string | null>(null);
  const [registeredSearch, setRegisteredSearch] = useState<string>("");

  // Dialog states for Registered Customers
  const [selectedRegisteredCustomer, setSelectedRegisteredCustomer] =
    useState<RegisteredCustomer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [editingRegisteredCustomer, setEditingRegisteredCustomer] =
    useState<RegisteredCustomer | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  // Filters State for Table Activity
  const [tableFilters, setTableFilters] = useState<CustomerFiltersValue>({
    search: "",
    status: "all",
  });
  
  // Dialog state for Table Activity
  const [selectedTableCustomer, setSelectedTableCustomer] =
    useState<GuestCustomerSummary | null>(null);

  const fetchRegisteredCustomers = async (signal?: AbortSignal) => {
    setRegisteredLoading(true);
    setRegisteredError(null);
    try {
      const data = await getRegisteredCustomers(signal);
      setRegisteredCustomers(data);
    } catch (err: unknown) {
      const apiError = normalizeApiError(err);
      if (!apiError.isCanceled) {
        setRegisteredError(apiError.message);
      }
    } finally {
      setRegisteredLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== USER_ROLES.admin) {
      return;
    }

    // Load table activity data
    void dispatch(loadCustomers());

    // Load registered customers data
    const controller = new AbortController();
    void Promise.resolve().then(() => fetchRegisteredCustomers(controller.signal));

    return () => {
      controller.abort();
    };
  }, [dispatch, user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    if (activeTab === 0) {
      void fetchRegisteredCustomers();
    } else {
      void dispatch(loadCustomers());
    }
  };

  // --- Registered Customers Actions ---
  const handleToggleActive = async (customer: RegisteredCustomer) => {
    try {
      const response = await toggleCustomerActiveStatus(customer.id);
      dispatch(notificationEnqueued(response || "Customer status updated successfully.", "success"));
      void fetchRegisteredCustomers();
      // Also reload table activity in case deactivation affects active ordering views
      void dispatch(loadCustomers());
    } catch (err: unknown) {
      dispatch(notificationEnqueued(normalizeApiError(err).message, "error"));
    }
  };

  const handleEditOpen = (customer: RegisteredCustomer) => {
    setEditingRegisteredCustomer(customer);
    setEditOpen(true);
  };

  const handleEditSubmit = async (data: EditCustomerInput) => {
    if (!editingRegisteredCustomer) return;
    try {
      const response = await updateCustomerProfile(editingRegisteredCustomer.id, data);
      dispatch(notificationEnqueued(response || "Customer profile updated successfully.", "success"));
      setEditOpen(false);
      setEditingRegisteredCustomer(null);
      void fetchRegisteredCustomers();
    } catch (err: unknown) {
      dispatch(notificationEnqueued(normalizeApiError(err).message, "error"));
      throw err;
    }
  };

  const handleViewDetails = (customer: RegisteredCustomer) => {
    setSelectedRegisteredCustomer(customer);
    setDetailsOpen(true);
  };

  // --- Filtered Data & Metrics ---
  const filteredRegisteredCustomers = useMemo(() => {
    if (!registeredSearch.trim()) {
      return registeredCustomers;
    }
    const term = registeredSearch.toLowerCase();
    return registeredCustomers.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phoneNumber && c.phoneNumber.toLowerCase().includes(term))
      );
    });
  }, [registeredCustomers, registeredSearch]);

  const registeredMetrics = useMemo(() => {
    const total = registeredCustomers.length;
    const active = registeredCustomers.filter((c) => c.isActive).length;
    const totalSpent = registeredCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
    const totalOrders = registeredCustomers.reduce((acc, c) => acc + c.totalOrders, 0);
    const avgSpend = total > 0 ? totalSpent / total : 0;
    return {
      total,
      active,
      totalSpent,
      totalOrders,
      avgSpend,
    };
  }, [registeredCustomers]);

  const filteredTableCustomers = useMemo(
    () => filterCustomers(customersData.data.customers, tableFilters),
    [customersData.data.customers, tableFilters]
  );

  const tableMetrics = useMemo(
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

  const isTableLoading = customersData.status === "pending";
  const isInitialTableLoading =
    customersData.status === "idle" ||
    (isTableLoading && customersData.data.customers.length === 0);

  const isInitialRegisteredLoading = registeredLoading && registeredCustomers.length === 0;

  return (
    <Stack spacing={3}>
      {/* Page Header */}
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
            Manage registered customer profiles and monitor guest table order history.
          </Typography>
        </Stack>
        <Button
          disabled={activeTab === 0 ? registeredLoading : isTableLoading}
          onClick={handleRefresh}
          startIcon={
            (activeTab === 0 ? registeredLoading : isTableLoading) ? (
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

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="customer portal categories">
          <Tab label="Registered Accounts" id="customer-tab-0" aria-controls="customer-tabpanel-0" />
          <Tab label="Table Activity" id="customer-tab-1" aria-controls="customer-tabpanel-1" />
        </Tabs>
      </Box>

      {/* TAB 0: REGISTERED ACCOUNTS */}
      {activeTab === 0 && (
        <Stack spacing={3}>
          {registeredError && (
            <Alert
              action={
                <Button color="inherit" onClick={handleRefresh} size="small">
                  Retry
                </Button>
              }
              severity="error"
            >
              {registeredError}
            </Alert>
          )}

          {isInitialRegisteredLoading ? (
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
                  Loading registered customer profiles...
                </Typography>
              </Stack>
            </Paper>
          ) : (
            <>
              {/* Metrics Grid */}
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
                  helperText="Total customer profiles"
                  label="Registered accounts"
                  value={registeredMetrics.total}
                />
                <CustomerMetricCard
                  helperText="Accounts allowed to order"
                  label="Active accounts"
                  value={registeredMetrics.active}
                />
                <CustomerMetricCard
                  helperText="Orders from registered users"
                  label="Total orders"
                  value={registeredMetrics.totalOrders}
                />
                <CustomerMetricCard
                  helperText="Revenue from registered users"
                  label="Total spent"
                  value={currencyFormatter.format(registeredMetrics.totalSpent)}
                />
                <CustomerMetricCard
                  helperText="Average spend per account"
                  label="Avg. spend"
                  value={currencyFormatter.format(registeredMetrics.avgSpend)}
                />
              </Box>

              {/* Filters / Search Bar */}
              <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2 }}>
                <TextField
                  fullWidth
                  label="Search by name, email, or phone..."
                  onChange={(e) => setRegisteredSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  value={registeredSearch}
                />
              </Paper>

              <Stack spacing={0.5}>
                <Typography component="h2" variant="h6">
                  Registered Customers
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Showing {filteredRegisteredCustomers.length} of {registeredCustomers.length} registered profiles.
                </Typography>
              </Stack>

              {/* Table */}
              <RegisteredCustomersTable
                customers={filteredRegisteredCustomers}
                onEdit={handleEditOpen}
                onToggleActive={handleToggleActive}
                onView={handleViewDetails}
              />
            </>
          )}
        </Stack>
      )}

      {/* TAB 1: TABLE ACTIVITY */}
      {activeTab === 1 && (
        <Stack spacing={3}>
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

          {isInitialTableLoading ? (
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
              {/* Metrics Grid */}
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
                  value={tableMetrics.servedTables}
                />
                <CustomerMetricCard
                  helperText="Orders from QR checkout"
                  label="Guest orders"
                  value={tableMetrics.guestOrders}
                />
                <CustomerMetricCard
                  helperText="Tables with open kitchen flow"
                  label="Active tables"
                  value={tableMetrics.activeTables}
                />
                <CustomerMetricCard
                  helperText="Across all guest orders"
                  label="Total spend"
                  value={currencyFormatter.format(tableMetrics.totalRevenue)}
                />
                <CustomerMetricCard
                  helperText="Average value per order"
                  label="Avg. order"
                  value={currencyFormatter.format(tableMetrics.averageOrderValue)}
                />
              </Box>

              {/* Filters */}
              <CustomerFilters filters={tableFilters} onFiltersChange={setTableFilters} />

              <Stack spacing={0.5}>
                <Typography component="h2" variant="h6">
                  Table activity
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Showing {filteredTableCustomers.length} of{" "}
                  {customersData.data.customers.length} table records.
                </Typography>
              </Stack>

              {/* Table */}
              <CustomerActivityTable
                customers={filteredTableCustomers}
                onView={setSelectedTableCustomer}
              />
            </>
          )}
        </Stack>
      )}

      {/* --- Dialogs --- */}

      {/* Table Activity Details Dialog */}
      <CustomerDetailsDialog
        customer={selectedTableCustomer}
        onClose={() => setSelectedTableCustomer(null)}
        open={Boolean(selectedTableCustomer)}
      />

      {/* Registered Customer Details Dialog */}
      <RegisteredCustomerDetailsDialog
        customer={selectedRegisteredCustomer}
        onClose={() => {
          setSelectedRegisteredCustomer(null);
          setDetailsOpen(false);
        }}
        open={detailsOpen}
      />

      {/* Registered Customer Edit Dialog */}
      <RegisteredCustomerEditDialog
        customer={editingRegisteredCustomer}
        onClose={() => {
          setEditingRegisteredCustomer(null);
          setEditOpen(false);
        }}
        onSubmit={handleEditSubmit}
        open={editOpen}
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
