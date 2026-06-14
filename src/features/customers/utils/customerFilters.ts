import type {
  CustomerFilters,
  CustomerMetrics,
  CustomerOrderHistory,
  GuestCustomerSummary,
} from "../types/customer.types";

const ACTIVE_ORDER_STATUSES = new Set([
  "Pending",
  "Assigned",
  "Accepted",
  "Preparing",
  "Ready",
]);

export const filterCustomers = (
  customers: GuestCustomerSummary[],
  filters: CustomerFilters
) => {
  const search = filters.search.trim().toLowerCase();

  return customers.filter((customer) => {
    const matchesStatus =
      filters.status === "all" ||
      customer.orders.some((order) => order.status === filters.status);

    if (!matchesStatus) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      `table ${customer.tableNumber}`.includes(search) ||
      String(customer.tableNumber).includes(search) ||
      customer.orders.some((order) => {
        const orderText = [
          `order ${order.id}`,
          `#${order.id}`,
          order.status,
          ...order.items.map((item) => item.name),
        ]
          .join(" ")
          .toLowerCase();

        return orderText.includes(search);
      })
    );
  });
};

export const getCustomerMetrics = (
  customers: GuestCustomerSummary[],
  orders: CustomerOrderHistory[]
): CustomerMetrics => {
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const activeTables = customers.filter((customer) =>
    customer.orders.some((order) => ACTIVE_ORDER_STATUSES.has(order.status))
  ).length;

  return {
    activeTables,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    guestOrders: orders.length,
    servedTables: customers.length,
    totalRevenue,
  };
};
