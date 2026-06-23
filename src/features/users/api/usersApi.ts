import { apiClient, API_ENDPOINTS, parseApiResponse } from "@/services/api";
import { userListResponseSchema } from "../schemas/userSchema";
import type { CreateUserInput, UpdateUserInput, User } from "../types/users.types";

export const getUsers = async (signal?: AbortSignal): Promise<User[]> => {
  const config = signal ? { signal } : undefined;
  const response = await apiClient.get<unknown>(API_ENDPOINTS.users, config);
  return parseApiResponse(userListResponseSchema, response.data);
};

export const createUser = async (data: CreateUserInput): Promise<string> => {
  const response = await apiClient.post<string>(
    API_ENDPOINTS.users,
    data
  );
  return response.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserInput
): Promise<string> => {
  const response = await apiClient.put<string>(
    `${API_ENDPOINTS.users}/${id}`,
    data
  );
  return response.data;
};

export const deleteUser = async (id: number): Promise<string> => {
  const response = await apiClient.delete<string>(
    `${API_ENDPOINTS.users}/${id}`
  );
  return response.data;
};
