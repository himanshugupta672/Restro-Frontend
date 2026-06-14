import type { AsyncState } from "@/store";
import type { OrderStatus } from "@/types/order";

export interface ReportCategory {
  id: number;
  name: string;
}

export interface ReportMenuItem {
  categoryId: number;
  categoryName: string;
  id: number;
  name: string;
  price: number;
}

export interface ReportOrderItem {
  categoryId: number | null;
  categoryName: string;
  lineTotal: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ReportOrder {
  createdAt: string;
  id: number;
  items: ReportOrderItem[];
  status: OrderStatus;
  tableNumber: number;
  totalAmount: number;
}

export interface ReportsData {
  categories: ReportCategory[];
  menuItems: ReportMenuItem[];
  orders: ReportOrder[];
}

export interface ReportsState {
  data: AsyncState<ReportsData>;
}

export interface ReportFilters {
  categoryId: number | "all";
  dateFrom: string;
  dateTo: string;
  status: OrderStatus | "all";
}

export interface RevenueSummary {
  activeRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  completedRevenue: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface StatusBreakdown {
  count: number;
  revenue: number;
  status: OrderStatus;
}

export interface TopMenuItemReport {
  categoryName: string;
  menuItemId: number;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface RevenueByDayReport {
  date: string;
  orderCount: number;
  revenue: number;
}
