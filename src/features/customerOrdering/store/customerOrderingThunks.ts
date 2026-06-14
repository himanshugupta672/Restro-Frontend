import type { AppPendingMeta } from "@/store/async";
import { toAppAsyncError } from "@/store/async";
import { createAppAsyncThunk } from "@/store/createAppAsyncThunk";

import {
  getCustomerMenu,
  placeCustomerOrder,
  trackCustomerOrder,
} from "../api/customerOrderingApi";
import type {
  CustomerMenuData,
  CustomerOrder,
  PlaceCustomerOrderInput,
  TrackCustomerOrderInput,
} from "../types/customerOrdering.types";

export const loadCustomerMenu = createAppAsyncThunk<CustomerMenuData>(
  "customerOrdering/loadMenu",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getCustomerMenu(signal);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[loadCustomerMenu] Failed:", error);
      }
      return rejectWithValue(toAppAsyncError(error, { notify: true }));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().customerOrdering.menu.status !== "pending",
  }
);

export const submitCustomerOrder = createAppAsyncThunk<
  CustomerOrder,
  PlaceCustomerOrderInput
>(
  "customerOrdering/placeOrder",
  async (input, { rejectWithValue }) => {
    try {
      return await placeCustomerOrder(input);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[submitCustomerOrder] Failed:", error);
      }
      return rejectWithValue(toAppAsyncError(error, { notify: true }));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().customerOrdering.placementStatus !== "pending",
  }
);

export const refreshCustomerOrder = createAppAsyncThunk<
  CustomerOrder,
  TrackCustomerOrderInput
>(
  "customerOrdering/trackOrder",
  async (input, { rejectWithValue }) => {
    try {
      return await trackCustomerOrder(input);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[refreshCustomerOrder] Failed:", error);
      }
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().customerOrdering.trackingStatus !== "pending",
    getPendingMeta: () => ({ globalLoading: false }) satisfies AppPendingMeta,
  }
);
