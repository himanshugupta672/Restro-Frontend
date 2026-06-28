import { persistedCustomerSessionSchema } from "../schemas/customerOrderingSchemas";
import type {
  CustomerOrderingState,
  PersistedCustomerOrderingSession,
} from "../types/customerOrdering.types";
import { isActiveCustomerOrder } from "./activeOrder";

const STORAGE_KEY = "restaurant.customer-ordering";
const STORAGE = localStorage;
const LEGACY_STORAGE = sessionStorage;

export const loadCustomerSession =
  (): PersistedCustomerOrderingSession | null => {
    try {
      const value =
        STORAGE.getItem(STORAGE_KEY) ?? LEGACY_STORAGE.getItem(STORAGE_KEY);
      if (!value) {
        return null;
      }

      const raw = JSON.parse(value) as unknown;

      // Migrate from legacy single-order format
      if (
        typeof raw === "object" &&
        raw !== null &&
        "currentOrder" in raw &&
        !("activeOrders" in raw)
      ) {
        const legacy = raw as any;
        const migrated: any = {
          ...legacy,
          activeOrders: legacy.currentOrder ? [legacy.currentOrder] : [],
        };
        delete migrated.currentOrder;
        const parsed = persistedCustomerSessionSchema.safeParse(migrated);
        if (!parsed.success) {
          return null;
        }
        return {
          ...parsed.data,
          activeOrders: parsed.data.activeOrders.filter(isActiveCustomerOrder),
        };
      }

      const parsed = persistedCustomerSessionSchema.safeParse(raw);
      if (!parsed.success) {
        return null;
      }

      return {
        ...parsed.data,
        activeOrders: parsed.data.activeOrders.filter(isActiveCustomerOrder),
      };
    } catch {
      return null;
    }
  };

export const saveCustomerSession = (state: CustomerOrderingState) => {
  const session: PersistedCustomerOrderingSession = {
    activeOrders: state.activeOrders.filter(isActiveCustomerOrder),
    cart: state.cart,
    tableNumber: state.tableNumber,
  };

  try {
    STORAGE.setItem(STORAGE_KEY, JSON.stringify(session));
    LEGACY_STORAGE.removeItem(STORAGE_KEY);
  } catch {
    // Ordering still works in memory when browser storage is unavailable.
  }
};

export const getCartItemCount = (state: CustomerOrderingState) =>
  state.cart.reduce((total, item) => total + item.quantity, 0);

export const getCartTotal = (state: CustomerOrderingState) =>
  state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
