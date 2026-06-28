import { apiClient, API_ENDPOINTS, parseApiResponse } from "@/services/api";
import { restaurantTableSchema, restaurantTablesSchema } from "../schemas/tableSchemas";
import type { CreateTableInput, RestaurantTable } from "../types/tables.types";

export const getTables = async (
  signal?: AbortSignal
): Promise<RestaurantTable[]> => {
  const config = signal ? { signal } : undefined;
  const response = await apiClient.get<unknown>(API_ENDPOINTS.tables.root, config);
  return parseApiResponse(restaurantTablesSchema, response.data);
};

export const createTable = async (
  input: CreateTableInput
): Promise<RestaurantTable> => {
  const response = await apiClient.post<unknown>(API_ENDPOINTS.tables.root, input);
  return parseApiResponse(restaurantTableSchema, response.data);
};

export const updateTable = async (
  id: number,
  input: CreateTableInput
): Promise<RestaurantTable> => {
  const response = await apiClient.put<unknown>(
    `${API_ENDPOINTS.tables.root}/${id}`,
    input
  );
  return parseApiResponse(restaurantTableSchema, response.data);
};

export const deleteTable = async (id: number): Promise<string> => {
  const response = await apiClient.delete<string>(
    `${API_ENDPOINTS.tables.root}/${id}`
  );
  return response.data;
};
