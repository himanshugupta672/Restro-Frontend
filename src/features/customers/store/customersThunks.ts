import { toAppAsyncError } from "@/store/async";
import { createAppAsyncThunk } from "@/store/createAppAsyncThunk";

import { getCustomersData } from "../api/customersApi";
import type { CustomersData } from "../types/customer.types";

export const loadCustomers = createAppAsyncThunk<CustomersData>(
  "customers/load",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getCustomersData(signal);
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().customers.data.status !== "pending",
  }
);
