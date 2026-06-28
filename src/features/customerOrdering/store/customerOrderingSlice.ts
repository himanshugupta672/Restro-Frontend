import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

import type {
  CustomerMenuItem,
  CustomerOrderingState,
} from "../types/customerOrdering.types";
import { isActiveCustomerOrder } from "../utils/activeOrder";
import { loadCustomerSession } from "../utils/customerSession";
import {
  loadCustomerMenu,
  refreshCustomerOrder,
  submitCustomerOrder,
} from "./customerOrderingThunks";

const persistedSession = loadCustomerSession();

const initialState: CustomerOrderingState = {
  cart: persistedSession?.cart ?? [],
  activeOrders: persistedSession?.activeOrders ?? [],
  menu: {
    data: null,
    error: null,
    status: "idle",
  },
  placementError: null,
  placementStatus: "idle",
  tableNumber: persistedSession?.tableNumber ?? null,
  trackingError: null,
  trackingStatus: "idle",
};

const customerOrderingSlice = createSlice({
  name: "customerOrdering",
  initialState,
  reducers: {
    cartCleared: (state) => {
      state.cart = [];
    },
    cartItemAdded: (state, action: PayloadAction<CustomerMenuItem>) => {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      state.cart.push({
        ...action.payload,
        quantity: 1,
      });
    },
    cartItemDecremented: (state, action: PayloadAction<number>) => {
      const item = state.cart.find(
        (cartItem) => cartItem.id === action.payload
      );
      if (!item) {
        return;
      }

      if (item.quantity === 1) {
        state.cart = state.cart.filter(
          (cartItem) => cartItem.id !== action.payload
        );
        return;
      }

      item.quantity -= 1;
    },
    cartItemRemoved: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    cartItemSetQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const item = state.cart.find(
        (cartItem) => cartItem.id === action.payload.id
      );
      if (!item) {
        return;
      }

      item.quantity = Math.max(1, action.payload.quantity);
    },
    cartItemsReordered: (state, action: PayloadAction<CustomerMenuItem[]>) => {
      // For reordering: we clear the current cart and replace it with the new items, or append them.
      // A clean drop-in replacement is typically what "Reorder" does in food apps, 
      // but let's replace or add to make it work. Let's do replacement for simplicity and predictability.
      state.cart = action.payload.map(item => ({
        ...item,
        quantity: (item as any).quantity || 1
      }));
    },
    customerOrderErrorCleared: (state) => {
      state.placementError = null;
      state.trackingError = null;
    },
    customerTableNumberSet: (state, action: PayloadAction<number>) => {
      state.tableNumber = action.payload;
    },
    customerSessionCleared: (state) => {
      state.cart = [];
      state.activeOrders = [];
      state.menu = {
        data: null,
        error: null,
        status: "idle",
      };
      state.placementError = null;
      state.placementStatus = "idle";
      state.tableNumber = null;
      state.trackingError = null;
      state.trackingStatus = "idle";
    },
    orderRemoved: (state, action: PayloadAction<number>) => {
      state.activeOrders = state.activeOrders.filter(
        (order) => order.orderId !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCustomerMenu.pending, (state) => {
        state.menu.error = null;
        state.menu.status = "pending";
      })
      .addCase(loadCustomerMenu.fulfilled, (state, action) => {
        state.menu.data = action.payload;
        state.menu.error = null;
        state.menu.status = "succeeded";
      })
      .addCase(loadCustomerMenu.rejected, (state, action) => {
        if (action.meta.aborted || action.meta.condition) {
          state.menu.status = state.menu.data ? "succeeded" : "idle";
          return;
        }

        state.menu.error =
          action.payload ??
          ({
            message:
              action.error.message ?? "Could not load the restaurant menu.",
            notify: false,
          } as const);
        state.menu.status = "failed";
      })
      .addCase(submitCustomerOrder.pending, (state) => {
        state.placementError = null;
        state.placementStatus = "pending";
      })
      .addCase(submitCustomerOrder.fulfilled, (state, action) => {
        state.cart = [];
        // Add placed order to activeOrders
        state.activeOrders.push(action.payload);
        state.placementError = null;
        state.placementStatus = "succeeded";
      })
      .addCase(submitCustomerOrder.rejected, (state, action) => {
        if (action.meta.aborted || action.meta.condition) {
          state.placementStatus = "idle";
          return;
        }

        state.placementError =
          action.payload ??
          ({
            message: action.error.message ?? "Could not place your order.",
            notify: false,
          } as const);
        state.placementStatus = "failed";
      })
      .addCase(refreshCustomerOrder.pending, (state) => {
        state.trackingError = null;
        state.trackingStatus = "pending";
      })
      .addCase(refreshCustomerOrder.fulfilled, (state, action) => {
        // Update or add the order in activeOrders
        const index = state.activeOrders.findIndex(
          (o) => o.orderId === action.payload.orderId
        );
        if (index >= 0) {
          state.activeOrders[index] = action.payload;
        } else {
          state.activeOrders.push(action.payload);
        }
        state.trackingError = null;
        state.trackingStatus = "succeeded";
      })
      .addCase(refreshCustomerOrder.rejected, (state, action) => {
        if (action.meta.aborted || action.meta.condition) {
          state.trackingStatus = "idle";
          return;
        }

        state.trackingError =
          action.payload ??
          ({
            message:
              action.error.message ?? "Could not refresh your order status.",
            notify: false,
          } as const);
        state.trackingStatus = "failed";
      });
  },
});

export const {
  cartCleared,
  cartItemAdded,
  cartItemDecremented,
  cartItemRemoved,
  cartItemSetQuantity,
  cartItemsReordered,
  customerOrderErrorCleared,
  customerTableNumberSet,
  customerSessionCleared,
  orderRemoved,
} = customerOrderingSlice.actions;

export const selectCustomerOrdering = (state: RootState) =>
  state.customerOrdering;
export const selectCustomerCart = (state: RootState) =>
  state.customerOrdering.cart;
export const selectCustomerMenu = (state: RootState) =>
  state.customerOrdering.menu;
export const selectCustomerTableNumber = (state: RootState) =>
  state.customerOrdering.tableNumber;
export const selectCustomerActiveOrders = (state: RootState) =>
  state.customerOrdering.activeOrders.filter(isActiveCustomerOrder);
export const selectCustomerOrderById = (orderId: number) => (state: RootState) =>
  state.customerOrdering.activeOrders.find((o) => o.orderId === orderId) ?? null;

export const customerOrderingReducer = customerOrderingSlice.reducer;
