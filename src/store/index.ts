import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "@/features/auth/store/authSlice";
import { appStatusReducer } from "@/store/appStatus";

export const store = configureStore({
  reducer: {
    appStatus: appStatusReducer,
    auth: authReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { createAppAsyncThunk } from "./createAppAsyncThunk";
export type {
  AppAsyncError,
  AppPendingMeta,
  AsyncState,
  AsyncStatus,
} from "./async";
export { toAppAsyncError } from "./async";
