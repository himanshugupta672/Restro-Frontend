import type { OrderStatus } from "@/types/order";

import type { CustomerOrder } from "../types/customerOrdering.types";

const TERMINAL_STATUSES = new Set<OrderStatus>(["Cancelled", "Completed"]);

export const isActiveCustomerOrder = (
  order: CustomerOrder | null
): order is CustomerOrder =>
  Boolean(order && !TERMINAL_STATUSES.has(order.status));

export const getCustomerOrderStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case "Accepted":
    case "Assigned":
      return "Confirmed";
    case "Completed":
      return "Served/Delivered";
    default:
      return status;
  }
};

export const getEstimatedTimeLabel = (order: CustomerOrder) => {
  if (order.estimatedTimeMinutes) {
    return `${order.estimatedTimeMinutes} min`;
  }

  if (order.estimatedReadyAt) {
    const estimatedDate = new Date(order.estimatedReadyAt);
    if (!Number.isNaN(estimatedDate.getTime())) {
      return estimatedDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }

  return null;
};
