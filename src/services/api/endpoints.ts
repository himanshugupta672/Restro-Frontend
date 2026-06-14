export const API_ENDPOINTS = {
  auth: {
    forgotPassword: "/Auth/forgot-password",
    login: "/Auth/login",
    logout: "/Auth/logout",
    me: "/Auth/me",
    refreshToken: "/Auth/refresh-token",
  },
  categories: "/Category",
  chefs: {
    acceptOrder: "/Chef/accept-order",
    orders: "/Chef/orders",
    rejectOrder: "/Chef/reject-order",
    root: "/Chef",
    updateStatus: "/Chef/update-status",
  },
  menu: "/Menu",
  orders: "/Order",
  tables: {
    root: "/Table",
    session: "/Table/session",
  },
  users: "/User",
} as const;
