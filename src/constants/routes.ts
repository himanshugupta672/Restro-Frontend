export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  menu: "/menu",
  orders: "/orders",
  users: "/users",
  customers: "/customers",
  customerCart: "/customer/cart",
  customerCheckout: "/customer/checkout",
  customerMenu: "/customer/menu",
  customerLogin: "/customer/login",
  customerSignup: "/customer/signup",
  customerOrderConfirmation: "/customer/order-confirmation/:orderId",
  customerOrderTracking: "/customer/orders/:orderId",
  reports: "/reports",
  unauthorized: "/unauthorized",
} as const;

export const customerOrderConfirmationPath = (orderId: number) =>
  `/customer/order-confirmation/${orderId}`;

export const customerOrderTrackingPath = (orderId: number) =>
  `/customer/orders/${orderId}`;
