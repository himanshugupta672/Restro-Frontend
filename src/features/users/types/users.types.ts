export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string | null | undefined;
  address?: string | null | undefined;
  role: "Admin" | "Chef" | "Customer";
  status: "Available" | "Busy" | "Offline";
  lastAssignedAt?: string | null | undefined;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phoneNumber?: string | null | undefined;
  address?: string | null | undefined;
  password?: string;
  confirmPassword?: string;
  role: number;
}

export interface UpdateUserInput {
  name: string;
  email: string;
  phoneNumber?: string | null | undefined;
  address?: string | null | undefined;
  password?: string | null | undefined;
  role: number;
}
