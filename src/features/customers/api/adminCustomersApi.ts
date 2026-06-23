import { apiClient, API_ENDPOINTS } from "@/services/api";
import type { RegisteredCustomer, EditCustomerInput } from "../types/adminCustomers.types";

export const getRegisteredCustomers = async (
  signal?: AbortSignal
): Promise<RegisteredCustomer[]> => {
  const config = signal ? { signal } : undefined;
  const response = await apiClient.get<RegisteredCustomer[]>(
    `${API_ENDPOINTS.users}/customers`,
    config
  );
  return response.data;
};

export const toggleCustomerActiveStatus = async (id: number): Promise<string> => {
  const response = await apiClient.put<string>(
    `${API_ENDPOINTS.users}/${id}/toggle-active`
  );
  return response.data;
};

export const updateCustomerProfile = async (
  id: number,
  data: EditCustomerInput
): Promise<string> => {
  // Map EditCustomerInput to backend's UpdateUserDto (forces role = 2 for Customer)
  const payload = {
    name: `${data.firstName} ${data.lastName}`.trim(),
    email: data.email,
    phoneNumber: data.phoneNumber,
    address: data.address,
    role: 2, // Customer role
  };
  
  const response = await apiClient.put<string>(
    `${API_ENDPOINTS.users}/${id}`,
    payload
  );
  return response.data;
};
