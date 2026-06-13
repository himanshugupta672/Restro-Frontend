import { notificationEnqueued } from "@/store/appStatus";
import type { AppPendingMeta } from "@/store/async";
import { toAppAsyncError } from "@/store/async";
import { createAppAsyncThunk } from "@/store/createAppAsyncThunk";

import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
} from "../api/authApi";
import type { AuthSession, LoginCredentials } from "../types/auth.types";

export const loginUser = createAppAsyncThunk<AuthSession, LoginCredentials>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);

      return {
        accessToken: response.accessToken,
        user: {
          email: credentials.email,
          id: response.userId,
          role: response.role,
        },
      };
    } catch (error) {
      const appError = toAppAsyncError(error, { notify: false });

      if (appError.status === 401) {
        appError.message = "Email or password is incorrect.";
      }

      return rejectWithValue(appError);
    }
  },
  {
    condition: (_, { getState }) => getState().auth.loginStatus !== "pending",
  }
);

export const restoreSession = createAppAsyncThunk<AuthSession>(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await refreshAccessToken();
      const user = await getCurrentUser(accessToken);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().auth.status === "checking" && !getState().auth.restoreStarted,
    getPendingMeta: () => ({ globalLoading: false }) satisfies AppPendingMeta,
  }
);

export const logoutUser = createAppAsyncThunk<void>(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await logout();
      dispatch(notificationEnqueued("Signed out successfully.", "success"));
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  },
  {
    condition: (_, { getState }) => getState().auth.status === "authenticated",
  }
);
