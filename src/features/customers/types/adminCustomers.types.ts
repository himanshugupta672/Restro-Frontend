export interface RegisteredCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  isActive: boolean;
  createdDate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string | null;
}

export interface EditCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
}
