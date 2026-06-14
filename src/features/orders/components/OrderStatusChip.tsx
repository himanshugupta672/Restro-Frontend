import { Chip } from "@mui/material";

import type { OrderStatus } from "@/types/order";

interface OrderStatusChipProps {
  status: OrderStatus;
}

const statusColors: Record<
  OrderStatus,
  "default" | "error" | "info" | "success" | "warning"
> = {
  Accepted: "info",
  Assigned: "info",
  Cancelled: "error",
  Completed: "success",
  Pending: "warning",
  Preparing: "warning",
  Ready: "success",
};

export const OrderStatusChip = ({ status }: OrderStatusChipProps) => (
  <Chip color={statusColors[status]} label={status} size="small" />
);
