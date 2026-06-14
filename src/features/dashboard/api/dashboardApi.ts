import type { UserRole } from "@/features/auth";
import { USER_ROLES } from "@/features/auth";
import {
  apiClient,
  API_ENDPOINTS,
  parseApiResponse,
  publicApiClient,
} from "@/services/api";

import {
  dashboardCategoriesSchema,
  dashboardMenuItemsSchema,
  dashboardOrdersSchema,
  dashboardTablesSchema,
  dashboardUsersSchema,
} from "../schemas/dashboardSchemas";
import type { DashboardData } from "../types/dashboard.types";

export const getDashboard = async (
  role: UserRole,
  signal?: AbortSignal
): Promise<DashboardData> => {
  const requestConfig = signal ? { signal } : undefined;

  const [menuResponse, categoriesResponse, ordersResponse, adminCounts] =
    await Promise.all([
      publicApiClient.get<unknown>(API_ENDPOINTS.menu, requestConfig),
      publicApiClient.get<unknown>(API_ENDPOINTS.categories, requestConfig),
      role === USER_ROLES.customer
        ? Promise.resolve(null)
        : apiClient.get<unknown>(
            role === USER_ROLES.chef
              ? API_ENDPOINTS.chefs.orders
              : API_ENDPOINTS.orders,
            requestConfig
          ),
      role === USER_ROLES.admin
        ? Promise.all([
            apiClient.get<unknown>(API_ENDPOINTS.users, requestConfig),
            apiClient.get<unknown>(API_ENDPOINTS.tables.root, requestConfig),
          ])
        : Promise.resolve(null),
    ]);

  const menuItems = parseApiResponse(
    dashboardMenuItemsSchema,
    menuResponse.data
  );
  const categoriesCount = parseApiResponse(
    dashboardCategoriesSchema,
    categoriesResponse.data
  ).length;
  const orders = ordersResponse
    ? parseApiResponse(dashboardOrdersSchema, ordersResponse.data)
    : [];

  if (!adminCounts) {
    return {
      categoriesCount,
      menuItems,
      orders,
      tablesCount: null,
      usersCount: null,
    };
  }

  const [usersResponse, tablesResponse] = adminCounts;

  return {
    categoriesCount,
    menuItems,
    orders,
    tablesCount: parseApiResponse(dashboardTablesSchema, tablesResponse.data)
      .length,
    usersCount: parseApiResponse(dashboardUsersSchema, usersResponse.data)
      .length,
  };
};
