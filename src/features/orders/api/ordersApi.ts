import { USER_ROLES, type UserRole } from "@/features/auth";
import {
  apiClient,
  API_ENDPOINTS,
  parseApiResponse,
  publicApiClient,
} from "@/services/api";
import { ORDER_STATUS_VALUES, type OrderStatus } from "@/types/order";

import {
  chefsSchema,
  orderMenuItemsSchema,
  rawOrdersSchema,
} from "../schemas/orderSchemas";
import type { Order, OrdersData } from "../types/order.types";

export const getOrdersData = async (
  role: UserRole,
  signal?: AbortSignal
): Promise<OrdersData> => {
  const config = signal ? { signal } : undefined;
  const ordersEndpoint =
    role === USER_ROLES.chef
      ? API_ENDPOINTS.chefs.orders
      : API_ENDPOINTS.orders;

  const [ordersResponse, menuResponse, chefsResponse] = await Promise.all([
    apiClient.get<unknown>(ordersEndpoint, config),
    publicApiClient.get<unknown>(API_ENDPOINTS.menu, config),
    role === USER_ROLES.admin
      ? apiClient.get<unknown>(`${API_ENDPOINTS.users}/chefs`, config)
      : Promise.resolve(null),
  ]);

  const rawOrders = parseApiResponse(rawOrdersSchema, ordersResponse.data);
  const menuItems = parseApiResponse(orderMenuItemsSchema, menuResponse.data);
  const chefs = chefsResponse
    ? parseApiResponse(chefsSchema, chefsResponse.data)
    : [];
  const menuNames = new Map(menuItems.map((item) => [item.id, item.name]));
  const chefNames = new Map(chefs.map((chef) => [chef.id, chef.name]));

  const orders: Order[] = rawOrders
    .map((order) => ({
      chefId: order.chefId ?? null,
      chefName: order.chefId
        ? (chefNames.get(order.chefId) ?? `Chef #${order.chefId}`)
        : null,
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
    }))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

  return { orders };
};

export const updateOrderStatus = async (
  role: UserRole,
  orderId: number,
  status: OrderStatus
) => {
  const statusValue = ORDER_STATUS_VALUES[status];

  if (role === USER_ROLES.chef) {
    await apiClient.put(API_ENDPOINTS.chefs.updateStatus, undefined, {
      params: { orderId, status: statusValue },
    });
    return;
  }

  await apiClient.put(`${API_ENDPOINTS.orders}/${orderId}/status`, undefined, {
    params: { status: statusValue },
  });
};

export const acceptOrder = async (orderId: number) => {
  await apiClient.put(API_ENDPOINTS.chefs.acceptOrder, undefined, {
    params: { orderId },
  });
};

export const rejectOrder = async (orderId: number) => {
  await apiClient.put(API_ENDPOINTS.chefs.rejectOrder, undefined, {
    params: { orderId },
  });
};
