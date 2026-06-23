import {
  apiClient,
  API_ENDPOINTS,
  parseApiResponse,
  publicApiClient,
} from "@/services/api";

import {
  customerMenuItemsSchema,
  rawCustomerOrdersSchema,
} from "../schemas/customerSchemas";
import type {
  CustomerOrderHistory,
  CustomersData,
  GuestCustomerSummary,
} from "../types/customer.types";

const ACTIVE_ORDER_STATUSES = new Set([
  "Pending",
  "Assigned",
  "Accepted",
  "Preparing",
  "Ready",
]);

export const getCustomersData = async (
  signal?: AbortSignal
): Promise<CustomersData> => {
  const config = signal ? { signal } : undefined;
  const [ordersResponse, menuResponse] = await Promise.all([
    apiClient.get<unknown>(API_ENDPOINTS.orders, config),
    publicApiClient.get<unknown>(API_ENDPOINTS.menu, config),
  ]);

  const rawOrders = parseApiResponse(
    rawCustomerOrdersSchema,
    ordersResponse.data
  );
  const menuItems = parseApiResponse(customerMenuItemsSchema, menuResponse.data);
  const menuNames = new Map(menuItems.map((item) => [item.id, item.name]));

  const orders = rawOrders
    .map(
      (order): CustomerOrderHistory => ({
        createdAt: order.createdAt,
        id: order.id,
        items: order.orderItems.map((item) => ({
          id: item.id,
          lineTotal: item.price * item.quantity,
          menuItemId: item.menuItemId,
          name: menuNames.get(item.menuItemId) ?? `Menu item #${item.menuItemId}`,
          price: item.price,
          quantity: item.quantity,
        })),
        status: order.status,
        tableId: order.tableId,
        tableNumber: order.tableNumber,
        totalAmount: order.totalAmount,
        customerId: order.customerId ?? null,
      })
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

  const groupedByTable = new Map<number, CustomerOrderHistory[]>();

  for (const order of orders) {
    const existing = groupedByTable.get(order.tableNumber) ?? [];
    existing.push(order);
    groupedByTable.set(order.tableNumber, existing);
  }

  const customers = Array.from(groupedByTable.entries())
    .map(([tableNumber, tableOrders]): GuestCustomerSummary => {
      const orderedByDate = [...tableOrders].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime()
      );
      const totalRevenue = tableOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      const completedOrders = tableOrders.filter(
        (order) => order.status === "Completed"
      ).length;
      const activeOrders = tableOrders.filter((order) =>
        ACTIVE_ORDER_STATUSES.has(order.status)
      ).length;

      return {
        activeOrders,
        averageOrderValue:
          tableOrders.length > 0 ? totalRevenue / tableOrders.length : 0,
        completedOrders,
        firstOrderAt: orderedByDate[0]?.createdAt ?? new Date().toISOString(),
        lastOrderAt:
          orderedByDate[orderedByDate.length - 1]?.createdAt ??
          new Date().toISOString(),
        orders: tableOrders,
        tableId: tableOrders[0]?.tableId ?? tableNumber,
        tableNumber,
        totalOrders: tableOrders.length,
        totalRevenue,
      };
    })
    .sort(
      (left, right) =>
        new Date(right.lastOrderAt).getTime() -
        new Date(left.lastOrderAt).getTime()
    );

  return {
    customers,
    orders,
  };
};
