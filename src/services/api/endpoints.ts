export const API_ENDPOINTS = {
  auth: {
    forgotPassword: "/Auth/forgot-password",
    login: "/Auth/login",
    logout: "/Auth/logout",
    me: "/Auth/me",
    refreshToken: "/Auth/refresh-token",
  },
  categories: "/Category",
  chefs: "/Chef",
  menu: "/Menu",
  orders: "/Order",
  tables: "/Table",
  users: "/User",
} as const;
