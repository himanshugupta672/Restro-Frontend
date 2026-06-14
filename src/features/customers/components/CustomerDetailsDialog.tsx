import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { OrderStatus } from "@/types/order";

import type { GuestCustomerSummary } from "../types/customer.types";

interface CustomerDetailsDialogProps {
  customer: GuestCustomerSummary | null;
  onClose: () => void;
  open: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
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

export const CustomerDetailsDialog = ({
  customer,
  onClose,
  open,
}: CustomerDetailsDialogProps) => (
  <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
    <DialogTitle>
      {customer ? `Table ${customer.tableNumber} activity` : "Table activity"}
    </DialogTitle>
    {customer && (
      <DialogContent>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ gap: 2, justifyContent: "space-between" }}
          >
            <Stack spacing={0.5}>
              <Typography color="text.secondary" variant="body2">
                First order: {dateFormatter.format(new Date(customer.firstOrderAt))}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Last order: {dateFormatter.format(new Date(customer.lastOrderAt))}
              </Typography>
            </Stack>
            <Stack spacing={0.5} sx={{ textAlign: { sm: "right" } }}>
              <Typography sx={{ fontWeight: 700 }}>
                {currencyFormatter.format(customer.totalRevenue)}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {customer.totalOrders} total orders
              </Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={2}>
            {customer.orders.map((order) => (
              <Stack
                key={order.id}
                spacing={1.5}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  sx={{ gap: 1, justifyContent: "space-between" }}
                >
                  <Stack spacing={0.25}>
                    <Typography sx={{ fontWeight: 700 }}>
                      Order #{order.id}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {dateFormatter.format(new Date(order.createdAt))}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      gap: 1,
                      justifyContent: { xs: "flex-start", sm: "flex-end" },
                    }}
                  >
                    <Chip
                      color={statusColors[order.status]}
                      label={order.status}
                      size="small"
                      variant="outlined"
                    />
                    <Typography sx={{ fontWeight: 700 }}>
                      {currencyFormatter.format(order.totalAmount)}
                    </Typography>
                  </Stack>
                </Stack>
                <Divider />
                <Stack spacing={1}>
                  {order.items.map((item) => (
                    <Stack
                      direction="row"
                      key={item.id}
                      sx={{ gap: 2, justifyContent: "space-between" }}
                    >
                      <Typography>
                        {item.quantity} x {item.name}
                      </Typography>
                      <Typography>
                        {currencyFormatter.format(item.lineTotal)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    )}
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);
