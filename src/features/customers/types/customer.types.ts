import type { AsyncState } from "@/store";
import type { OrderStatus } from "@/types/order";

export interface CustomerOrderItem {
  id: number;
  lineTotal: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerOrderHistory {
  createdAt: string;
  id: number;
  items: CustomerOrderItem[];
  status: OrderStatus;
  tableId: number;
  tableNumber: number;
  totalAmount: number;
  customerId?: number | null;
}

export interface GuestCustomerSummary {
  activeOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  firstOrderAt: string;
  lastOrderAt: string;
  orders: CustomerOrderHistory[];
  tableId: number;
  tableNumber: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface CustomersData {
  customers: GuestCustomerSummary[];
  orders: CustomerOrderHistory[];
}

export interface CustomersState {
  data: AsyncState<CustomersData>;
}

export interface CustomerFilters {
  search: string;
  status: OrderStatus | "all";
}

export interface CustomerMetrics {
  activeTables: number;
  averageOrderValue: number;
  guestOrders: number;
  servedTables: number;
  totalRevenue: number;
}
