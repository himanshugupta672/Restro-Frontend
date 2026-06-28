import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

import type { OrdersState } from "../types/order.types";
import {
  acceptChefOrder,
  changeOrderStatus,
  loadOrders,
  rejectChefOrder,
} from "./ordersThunks";

const initialState: OrdersState = {
  data: {
    data: {
      availableChefs: [],
      chefs: [],
      orders: [],
    },
    error: null,
    status: "idle",
  },
  mutationError: null,
  mutationStatus: "idle",
};

const mutationThunks = [
  changeOrderStatus,
  acceptChefOrder,
  rejectChefOrder,
] as const;

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    orderMutationCleared: (state) => {
      state.mutationError = null;
      state.mutationStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.data.error = null;
        state.data.status = "pending";
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.data.data = action.payload;
        state.data.error = null;
        state.data.status = "succeeded";
      })
      .addCase(loadOrders.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        if (action.meta.aborted) {
          state.data.status =
            state.data.data.orders.length > 0 ? "succeeded" : "idle";
          return;
        }

        state.data.error =
          action.payload ??
          ({
            message: action.error.message ?? "Could not load orders.",
            notify: false,
          } as const);
        state.data.status = "failed";
      })
      .addMatcher(
        isAnyOf(...mutationThunks.map((thunk) => thunk.pending)),
        (state) => {
          state.mutationError = null;
          state.mutationStatus = "pending";
        }
      )
      .addMatcher(
        isAnyOf(...mutationThunks.map((thunk) => thunk.fulfilled)),
        (state, action) => {
          state.data.data = action.payload;
          state.data.status = "succeeded";
          state.mutationError = null;
          state.mutationStatus = "succeeded";
        }
      )
      .addMatcher(
        isAnyOf(...mutationThunks.map((thunk) => thunk.rejected)),
        (state, action) => {
          if (action.meta.aborted || action.meta.condition) {
            state.mutationStatus = "idle";
            return;
          }

          state.mutationError =
            action.payload ??
            ({
              message:
                action.error.message ?? "The order could not be updated.",
              notify: false,
            } as const);
          state.mutationStatus = "failed";
        }
      );
  },
});

export const { orderMutationCleared } = ordersSlice.actions;

export const selectOrdersData = (state: RootState) => state.orders.data;
export const selectOrderMutationError = (state: RootState) =>
  state.orders.mutationError;
export const selectOrderMutationStatus = (state: RootState) =>
  state.orders.mutationStatus;

export const ordersReducer = ordersSlice.reducer;
