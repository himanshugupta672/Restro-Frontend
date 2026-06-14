import { createSlice } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

import type { CustomersState } from "../types/customer.types";
import { loadCustomers } from "./customersThunks";

const initialState: CustomersState = {
  data: {
    data: {
      customers: [],
      orders: [],
    },
    error: null,
    status: "idle",
  },
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCustomers.pending, (state) => {
        state.data.error = null;
        state.data.status = "pending";
      })
      .addCase(loadCustomers.fulfilled, (state, action) => {
        state.data.data = action.payload;
        state.data.error = null;
        state.data.status = "succeeded";
      })
      .addCase(loadCustomers.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        if (action.meta.aborted) {
          state.data.status =
            state.data.data.customers.length > 0 ? "succeeded" : "idle";
          return;
        }

        state.data.error =
          action.payload ??
          ({
            message:
              action.error.message ?? "Could not load customer activity.",
            notify: false,
          } as const);
        state.data.status = "failed";
      });
  },
});

export const selectCustomersData = (state: RootState) => state.customers.data;

export const customersReducer = customersSlice.reducer;
