import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { Order } from "../types/order.types";
import { OrderStatusChip } from "./OrderStatusChip";

interface OrderDetailsDialogProps {
  onClose: () => void;
  open: boolean;
  order: Order | null;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

export const OrderDetailsDialog = ({
  onClose,
  open,
  order,
}: OrderDetailsDialogProps) => (
  <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
    <DialogTitle>Order #{order?.id}</DialogTitle>
    {order && (
      <DialogContent>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ gap: 2, justifyContent: "space-between" }}
          >
            <Stack spacing={0.5}>
              <Typography color="text.secondary" variant="body2">
                Table {order.tableNumber}
              </Typography>
              <Typography>
                {dateFormatter.format(new Date(order.createdAt))}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {order.chefName ?? "No chef assigned"}
              </Typography>
            </Stack>
            <OrderStatusChip status={order.status} />
          </Stack>
          <Divider />
          <Stack spacing={2}>
            {order.items.map((item) => (
              <Stack
                direction="row"
                key={item.id}
                sx={{ gap: 2, justifyContent: "space-between" }}
              >
                <Stack>
                  <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {item.quantity} x {currencyFormatter.format(item.price)}
                  </Typography>
                </Stack>
                <Typography sx={{ fontWeight: 600 }}>
                  {currencyFormatter.format(item.lineTotal)}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700 }}>Order total</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {currencyFormatter.format(order.totalAmount)}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
    )}
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);
