import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "@/features/auth/store/authSlice";
import { customerOrderingReducer } from "@/features/customerOrdering/store/customerOrderingSlice";
import { saveCustomerSession } from "@/features/customerOrdering/utils/customerSession";
import { customersReducer } from "@/features/customers/store/customersSlice";
import { dashboardReducer } from "@/features/dashboard/store/dashboardSlice";
import { menuReducer } from "@/features/menu/store/menuSlice";
import { ordersReducer } from "@/features/orders/store/ordersSlice";
import { appStatusReducer } from "@/store/appStatus";

export const store = configureStore({
  reducer: {
    appStatus: appStatusReducer,
    auth: authReducer,
    customerOrdering: customerOrderingReducer,
    customers: customersReducer,
    dashboard: dashboardReducer,
    menu: menuReducer,
    orders: ordersReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

store.subscribe(() => {
  saveCustomerSession(store.getState().customerOrdering);
});

export { createAppAsyncThunk } from "./createAppAsyncThunk";
export type {
  AppAsyncError,
  AppPendingMeta,
  AsyncState,
  AsyncStatus,
} from "./async";
export { toAppAsyncError } from "./async";
