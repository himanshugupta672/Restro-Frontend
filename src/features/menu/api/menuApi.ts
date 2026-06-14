import {
  apiClient,
  API_ENDPOINTS,
  parseApiResponse,
  publicApiClient,
} from "@/services/api";

import { categoriesSchema, menuItemsSchema } from "../schemas/menuSchemas";
import type {
  CategoryInput,
  MenuData,
  MenuItemInput,
  UpdateCategoryInput,
  UpdateMenuItemInput,
} from "../types/menu.types";

export const getMenuData = async (signal?: AbortSignal): Promise<MenuData> => {
  const config = signal ? { signal } : undefined;
  const [categoriesResponse, menuItemsResponse] = await Promise.all([
    publicApiClient.get<unknown>(API_ENDPOINTS.categories, config),
    publicApiClient.get<unknown>(API_ENDPOINTS.menu, config),
  ]);

  return {
    categories: parseApiResponse(
      categoriesSchema,
      categoriesResponse.data
    ).sort((left, right) => left.displayOrder - right.displayOrder),
    menuItems: parseApiResponse(menuItemsSchema, menuItemsResponse.data),
  };
};

export const createCategory = async (input: CategoryInput) => {
  await apiClient.post(API_ENDPOINTS.categories, input);
};

export const updateCategory = async (input: UpdateCategoryInput) => {
  await apiClient.put(API_ENDPOINTS.categories, input);
};

export const deleteCategory = async (id: number) => {
  await apiClient.delete(`${API_ENDPOINTS.categories}/${id}`);
};

export const createMenuItem = async (input: MenuItemInput) => {
  await apiClient.post(API_ENDPOINTS.menu, input);
};

export const updateMenuItem = async ({ id, ...input }: UpdateMenuItemInput) => {
  await apiClient.put(`${API_ENDPOINTS.menu}/${id}`, input);
};

export const deleteMenuItem = async (id: number) => {
  await apiClient.delete(`${API_ENDPOINTS.menu}/${id}`);
};
