import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useAppSelector } from "@/hooks/reduxHooks";
import { selectCustomersData } from "../store/customersSlice";
import type { OrderStatus } from "@/types/order";
import type { RegisteredCustomer } from "../types/adminCustomers.types";

interface RegisteredCustomerDetailsDialogProps {
  customer: RegisteredCustomer | null;
  onClose: () => void;
  open: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusColors: Record<
  OrderStatus,
  "default" | "error" | "info" | "success" | "warning"
> = {
  Accepted: "info",
  Assigned: "warning",
  Cancelled: "error",
  Completed: "success",
  Pending: "warning",
  Preparing: "info",
  Ready: "success",
};

export const RegisteredCustomerDetailsDialog = ({
  customer,
  onClose,
  open,
}: RegisteredCustomerDetailsDialogProps) => {
  const { data } = useAppSelector(selectCustomersData);
  const orders = data.orders;

  // Filter orders for this customer
  const customerOrders = customer
    ? orders.filter((order) => order.customerId === customer.id)
    : [];

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Customer Profile
          </Typography>
          {customer && (
            <Chip
              color={customer.isActive ? "success" : "default"}
              label={customer.isActive ? "Active" : "Deactivated"}
              size="small"
            />
          )}
        </Stack>
      </DialogTitle>
      {customer && (
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Basic Information Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Account Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {customer.firstName} {customer.lastName}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Customer ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    #{customer.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Email Address
                  </Typography>
                  <Typography variant="body1">{customer.email}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Phone Number
                  </Typography>
                  <Typography variant="body1">{customer.phoneNumber || "Not provided"}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Registration Date
                  </Typography>
                  <Typography variant="body1">
                    {dateFormatter.format(new Date(customer.createdDate))}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Delivery/Billing Address
                  </Typography>
                  <Typography variant="body1">{customer.address || "Not provided"}</Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Statistics Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Order Statistics
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "action.hover" }}>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Total Orders
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {customer.totalOrders}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "action.hover" }}>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Total Spend
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                    {currencyFormatter.format(customer.totalSpent)}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "action.hover" }}>
                  <Typography color="text.secondary" variant="caption" sx={{ display: "block" }}>
                    Last Order Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, pt: 0.5 }}>
                    {customer.lastOrderDate
                      ? dateFormatter.format(new Date(customer.lastOrderDate))
                      : "No orders yet"}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Divider />

            {/* Complete Order History */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Order History ({customerOrders.length})
              </Typography>
              {customerOrders.length === 0 ? (
                <Typography color="text.secondary" variant="body2" sx={{ fontStyle: "italic" }}>
                  This customer has not placed any orders yet.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {customerOrders.map((order) => (
                    <Box
                      key={order.id}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        sx={{ gap: 1, justifyContent: "space-between", mb: 1.5 }}
                      >
                        <Stack spacing={0.25}>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            Order #{order.id} (Table {order.tableNumber})
                          </Typography>
                          <Typography color="text.secondary" variant="caption">
                            {dateTimeFormatter.format(new Date(order.createdAt))}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          sx={{
                            alignItems: "center",
                            gap: 1.5,
                            justifyContent: { xs: "flex-start", sm: "flex-end" },
                          }}
                        >
                          <Chip
                            color={statusColors[order.status]}
                            label={order.status}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {currencyFormatter.format(order.totalAmount)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Divider sx={{ mb: 1.5 }} />
                      <Stack spacing={1}>
                        {order.items.map((item) => (
                          <Stack
                            direction="row"
                            key={item.id}
                            sx={{ gap: 2, justifyContent: "space-between" }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {item.quantity} x {item.name}
                            </Typography>
                            <Typography variant="body2">
                              {currencyFormatter.format(item.lineTotal)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
