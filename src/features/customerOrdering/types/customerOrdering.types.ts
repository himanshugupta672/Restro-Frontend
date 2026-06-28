import type { AppAsyncError, AsyncState, AsyncStatus } from "@/store";
import type { OrderStatus } from "@/types/order";

export interface CustomerCategory {
  displayOrder: number;
  id: number;
  name: string;
}

export interface CustomerMenuItem {
  categoryId: number;
  description: string;
  id: number;
  imageUrl: string | null;
  name: string;
  prepTimeMinutes: number;
  price: number;
}

export interface CustomerMenuData {
  categories: CustomerCategory[];
  menuItems: CustomerMenuItem[];
}

export interface CartItem extends CustomerMenuItem {
  quantity: number;
}

export interface CustomerOrderItem {
  lineTotal: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerOrder {
  createdAt: string;
  estimatedReadyAt?: string | null | undefined;
  estimatedTimeMinutes?: number | null | undefined;
  items: CustomerOrderItem[];
  orderId: number;
  status: OrderStatus;
  specialInstructions?: string | null;
  tableId: number;
  tableNumber: number;
  totalAmount: number;
}

export interface CustomerOrderingState {
  activeOrders: CustomerOrder[];
  cart: CartItem[];
  menu: AsyncState<CustomerMenuData | null>;
  placementError: AppAsyncError | null;
  placementStatus: AsyncStatus;
  tableNumber: number | null;
  trackingError: AppAsyncError | null;
  trackingStatus: AsyncStatus;
}

export interface PlaceCustomerOrderInput {
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
  specialInstructions?: string;
  tableNumber: number;
}

export interface TrackCustomerOrderInput {
  orderId: number;
  tableNumber: number;
}

export interface PersistedCustomerOrderingSession {
  activeOrders: CustomerOrder[];
  cart: CartItem[];
  tableNumber: number | null;
}
