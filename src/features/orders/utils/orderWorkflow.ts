import { USER_ROLES, type UserRole } from "@/features/auth";
import type { OrderStatus } from "@/types/order";

import type { Order, OrderStatusFilter } from "../types/order.types";

const terminalStatuses = new Set<OrderStatus>(["Completed", "Cancelled"]);

export const getNextChefStatus = (status: OrderStatus): OrderStatus | null => {
  switch (status) {
    case "Accepted":
      return "Preparing";
    case "Preparing":
      return "Ready";
    case "Ready":
      return "Completed";
    default:
      return null;
  }
};

export const getAdminStatusOptions = (
  currentStatus: OrderStatus
): OrderStatus[] => {
  if (terminalStatuses.has(currentStatus)) {
    return [];
  }

  return [
    "Pending",
    "Accepted",
    "Preparing",
    "Ready",
    "Completed",
    "Cancelled",
  ].filter((status): status is OrderStatus => status !== currentStatus);
};

export const canChefAcceptOrReject = (order: Order) =>
  order.status === "Pending" || order.status === "Assigned";

export const getPrimaryOrderAction = (order: Order, role: UserRole) => {
  if (role === USER_ROLES.chef) {
    const nextStatus = getNextChefStatus(order.status);
    return nextStatus
      ? {
          label: `Mark ${nextStatus.toLowerCase()}`,
          status: nextStatus,
        }
      : null;
  }

  return null;
};

interface OrderFilters {
  search: string;
  status: OrderStatusFilter;
}

export const filterOrders = (orders: Order[], filters: OrderFilters) => {
  const search = filters.search.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesStatus =
      filters.status === "all" || order.status === filters.status;
    const matchesSearch =
      search.length === 0 ||
      order.id.toString().includes(search) ||
      order.tableNumber.toString().includes(search) ||
      order.chefName?.toLowerCase().includes(search) ||
      order.items.some((item) => item.name.toLowerCase().includes(search));

    return matchesStatus && matchesSearch;
  });
};
