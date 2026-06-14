import { USER_ROLES, type UserRole } from "@/features/auth";
import { ORDER_STATUSES } from "@/types/order";

import type {
  DashboardData,
  DashboardMetric,
  OrderStatusCount,
} from "../types/dashboard.types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const activeStatuses = new Set([
  "Pending",
  "Assigned",
  "Accepted",
  "Preparing",
  "Ready",
]);

export const getDashboardMetrics = (
  data: DashboardData,
  role: UserRole
): DashboardMetric[] => {
  const availableItems = data.menuItems.filter(
    (menuItem) => menuItem.isAvailable
  ).length;

  if (role === USER_ROLES.customer) {
    return [
      {
        helperText: "Items currently offered",
        label: "Available dishes",
        tone: "success",
        value: availableItems.toString(),
      },
      {
        helperText: "Browse across the full menu",
        label: "Categories",
        tone: "secondary",
        value: data.categoriesCount.toString(),
      },
    ];
  }

  const activeOrders = data.orders.filter((order) =>
    activeStatuses.has(order.status)
  ).length;
  const completedOrders = data.orders.filter(
    (order) => order.status === "Completed"
  );
  const completedRevenue = completedOrders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const metrics: DashboardMetric[] = [
    {
      helperText: `${data.orders.length} orders in the current dataset`,
      label: "Active orders",
      tone: "warning",
      value: activeOrders.toString(),
    },
    {
      helperText: `${completedOrders.length} completed orders`,
      label: "Completed revenue",
      tone: "success",
      value: currencyFormatter.format(completedRevenue),
    },
    {
      helperText: `${availableItems} currently available`,
      label: "Menu items",
      tone: "primary",
      value: data.menuItems.length.toString(),
    },
    {
      helperText: "Menu organization",
      label: "Categories",
      tone: "secondary",
      value: data.categoriesCount.toString(),
    },
  ];

  if (role === USER_ROLES.admin && data.usersCount !== null) {
    metrics.push({
      helperText: `${data.tablesCount ?? 0} restaurant tables`,
      label: "Team accounts",
      tone: "primary",
      value: data.usersCount.toString(),
    });
  }

  return metrics;
};

export const getOrderStatusCounts = (data: DashboardData): OrderStatusCount[] =>
  ORDER_STATUSES.map((status) => ({
    count: data.orders.filter((order) => order.status === status).length,
    status,
  })).filter((item) => item.count > 0);

export const getRecentOrders = (data: DashboardData) =>
  [...data.orders]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
