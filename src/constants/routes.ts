export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  menu: "/menu",
  orders: "/orders",
  customers: "/customers",
  customerCart: "/customer/cart",
  customerCheckout: "/customer/checkout",
  customerMenu: "/customer/menu",
  customerOrderConfirmation: "/customer/order-confirmation/:orderId",
  customerOrderTracking: "/customer/orders/:orderId",
  reports: "/reports",
  unauthorized: "/unauthorized",
} as const;

export const customerOrderConfirmationPath = (orderId: number) =>
  `/customer/order-confirmation/${orderId}`;

export const customerOrderTrackingPath = (orderId: number) =>
  `/customer/orders/${orderId}`;
