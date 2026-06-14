import type { AsyncState } from "@/store";
import type { OrderStatus } from "@/types/order";

export interface DashboardMenuItem {
  id: number;
  isAvailable: boolean;
  name: string;
  price: number;
}

export interface DashboardOrder {
  createdAt: string;
  id: number;
  status: OrderStatus;
  tableId: number;
  tableNumber: number;
  totalAmount: number;
}

export interface DashboardData {
  categoriesCount: number;
  menuItems: DashboardMenuItem[];
  orders: DashboardOrder[];
  tablesCount: number | null;
  usersCount: number | null;
}

export interface DashboardState {
  overview: AsyncState<DashboardData | null>;
}

export interface DashboardMetric {
  helperText: string;
  label: string;
  tone: "primary" | "secondary" | "success" | "warning";
  value: string;
}

export interface OrderStatusCount {
  count: number;
  status: OrderStatus;
}
