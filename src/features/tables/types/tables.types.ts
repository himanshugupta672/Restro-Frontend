export interface RestaurantTable {
  id: number;
  tableNumber: number;
  isActive: boolean;
  token: string;
}

export interface CreateTableInput {
  tableNumber: number;
  isActive: boolean;
}
