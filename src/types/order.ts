export const ORDER_STATUSES = [
  "Pending",
  "Assigned",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_VALUES: Record<OrderStatus, number> = {
  Accepted: 2,
  Assigned: 1,
  Cancelled: 6,
  Completed: 5,
  Pending: 0,
  Preparing: 3,
  Ready: 4,
};
