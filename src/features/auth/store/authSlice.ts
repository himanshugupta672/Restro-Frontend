import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

import type { AuthSession, AuthState } from "../types/auth.types";
import { loginUser, logoutUser, restoreSession } from "./authThunks";

const initialState: AuthState = {
  accessToken: null,
  loginError: null,
  loginStatus: "idle",
  logoutStatus: "idle",
  restoreStarted: false,
  status: "checking",
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    accessTokenRefreshed: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    loginErrorCleared: (state) => {
      state.loginError = null;
    },
    sessionEstablished: (state, action: PayloadAction<AuthSession>) => {
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
      state.user = action.payload.user;
    },
    sessionCleared: (state) => {
      state.accessToken = null;
      state.loginError = null;
      state.loginStatus = "idle";
      state.logoutStatus = "idle";
      state.status = "unauthenticated";
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginError = null;
        state.loginStatus = "pending";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.loginError = null;
        state.loginStatus = "succeeded";
        state.status = "authenticated";
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginError =
          action.payload ??
          ({
            message: action.error.message ?? "Sign in failed.",
            notify: false,
          } as const);
        state.loginStatus = "failed";
        state.status = "unauthenticated";
      })
      .addCase(restoreSession.pending, (state) => {
        state.restoreStarted = true;
        state.status = "checking";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.user = action.payload.user;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.accessToken = null;
        state.status = "unauthenticated";
        state.user = null;
      })
      .addCase(logoutUser.pending, (state) => {
        state.logoutStatus = "pending";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.loginError = null;
        state.loginStatus = "idle";
        state.logoutStatus = "succeeded";
        state.status = "unauthenticated";
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.accessToken = null;
        state.loginError = null;
        state.loginStatus = "idle";
        state.logoutStatus = "failed";
        state.status = "unauthenticated";
        state.user = null;
      });
  },
});

export const {
  accessTokenRefreshed,
  loginErrorCleared,
  sessionCleared,
  sessionEstablished,
} = authSlice.actions;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectLoginError = (state: RootState) => state.auth.loginError;
export const selectLoginStatus = (state: RootState) => state.auth.loginStatus;
export const selectLogoutStatus = (state: RootState) => state.auth.logoutStatus;

export const authReducer = authSlice.reducer;
