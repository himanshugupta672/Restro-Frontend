import { persistedCustomerSessionSchema } from "../schemas/customerOrderingSchemas";
import type {
  CustomerOrderingState,
  PersistedCustomerOrderingSession,
} from "../types/customerOrdering.types";

const STORAGE_KEY = "restaurant.customer-ordering";

export const loadCustomerSession =
  (): PersistedCustomerOrderingSession | null => {
    try {
      const value = sessionStorage.getItem(STORAGE_KEY);
      if (!value) {
        return null;
      }

      const parsed = persistedCustomerSessionSchema.safeParse(
        JSON.parse(value) as unknown
      );
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  };

export const saveCustomerSession = (state: CustomerOrderingState) => {
  const session: PersistedCustomerOrderingSession = {
    cart: state.cart,
    currentOrder: state.currentOrder,
    tableNumber: state.tableNumber,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ordering still works in memory when browser storage is unavailable.
  }
};

export const getCartItemCount = (state: CustomerOrderingState) =>
  state.cart.reduce((total, item) => total + item.quantity, 0);

export const getCartTotal = (state: CustomerOrderingState) =>
  state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
