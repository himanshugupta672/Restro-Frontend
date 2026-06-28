import type { UserRole } from "@/features/auth";
import type { AppAsyncError, AsyncState, AsyncStatus } from "@/store";
import type { OrderStatus } from "@/types/order";

export interface OrderItem {
  id: number;
  lineTotal: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  chefId: number | null;
  chefName: string | null;
  createdAt: string;
  id: number;
  items: OrderItem[];
  status: OrderStatus;
  tableId: number;
  tableNumber: number;
  totalAmount: number;
}

export interface ChefOption {
  id: number;
  isActive: boolean;
  name: string;
  status: string;
}

export interface OrdersData {
  availableChefs: ChefOption[];
  chefs: ChefOption[];
  orders: Order[];
}

export interface LoadOrdersInput {
  role: UserRole;
}

export interface UpdateOrderStatusInput extends LoadOrdersInput {
  chefId?: number | null;
  orderId: number;
  status: OrderStatus;
}

export interface OrderActionInput extends LoadOrdersInput {
  orderId: number;
}

export interface OrdersState {
  data: AsyncState<OrdersData>;
  mutationError: AppAsyncError | null;
  mutationStatus: AsyncStatus;
}

export type OrderStatusFilter = OrderStatus | "all";
