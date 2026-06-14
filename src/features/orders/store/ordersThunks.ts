import { notificationEnqueued } from "@/store/appStatus";
import type { AppDispatch } from "@/store";
import { toAppAsyncError } from "@/store/async";
import { createAppAsyncThunk } from "@/store/createAppAsyncThunk";

import {
  acceptOrder,
  getOrdersData,
  rejectOrder,
  updateOrderStatus,
} from "../api/ordersApi";
import type {
  LoadOrdersInput,
  OrderActionInput,
  OrdersData,
  UpdateOrderStatusInput,
} from "../types/order.types";

export const loadOrders = createAppAsyncThunk<OrdersData, LoadOrdersInput>(
  "orders/load",
  async ({ role }, { rejectWithValue, signal }) => {
    try {
      return await getOrdersData(role, signal);
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().orders.data.status !== "pending",
  }
);

const runOrderMutation = async (
  mutation: () => Promise<void>,
  role: LoadOrdersInput["role"],
  successMessage: string,
  signal: AbortSignal,
  dispatch: AppDispatch
) => {
  await mutation();
  const data = await getOrdersData(role, signal);
  dispatch(notificationEnqueued(successMessage, "success"));
  return data;
};

export const changeOrderStatus = createAppAsyncThunk<
  OrdersData,
  UpdateOrderStatusInput
>(
  "orders/changeStatus",
  async ({ orderId, role, status }, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runOrderMutation(
        () => updateOrderStatus(role, orderId, status),
        role,
        `Order #${orderId} moved to ${status}.`,
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);

export const acceptChefOrder = createAppAsyncThunk<
  OrdersData,
  OrderActionInput
>(
  "orders/accept",
  async ({ orderId, role }, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runOrderMutation(
        () => acceptOrder(orderId),
        role,
        `Order #${orderId} accepted.`,
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);

export const rejectChefOrder = createAppAsyncThunk<
  OrdersData,
  OrderActionInput
>(
  "orders/reject",
  async ({ orderId, role }, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runOrderMutation(
        () => rejectOrder(orderId),
        role,
        `Order #${orderId} returned to the queue.`,
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);
