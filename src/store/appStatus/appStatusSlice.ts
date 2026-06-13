import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { RootState } from "@/store";
import { isAppAsyncError } from "@/store/async/toAppAsyncError";

import type {
  AppNotification,
  NotificationSeverity,
  TrackedRequest,
} from "./appStatus.types";

interface AppStatusState {
  notifications: AppNotification[];
  requests: Record<string, TrackedRequest>;
}

const initialState: AppStatusState = {
  notifications: [],
  requests: {},
};

const appStatusSlice = createSlice({
  name: "appStatus",
  initialState,
  reducers: {
    notificationEnqueued: {
      prepare: (
        message: string,
        severity: NotificationSeverity = "success"
      ) => ({
        payload: {
          id: nanoid(),
          message,
          severity,
        } satisfies AppNotification,
      }),
      reducer: (state, action: PayloadAction<AppNotification>) => {
        state.notifications.push(action.payload);
      },
    },
    notificationDismissed: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state, action) => {
        const pendingMeta = action.meta as typeof action.meta & {
          globalLoading?: boolean;
        };

        state.requests[action.meta.requestId] = {
          globalLoading: pendingMeta.globalLoading !== false,
        };
      })
      .addMatcher(isFulfilled, (state, action) => {
        delete state.requests[action.meta.requestId];
      })
      .addMatcher(isRejected, (state, action) => {
        delete state.requests[action.meta.requestId];

        if (action.meta.aborted || action.meta.condition) {
          return;
        }

        if (isAppAsyncError(action.payload)) {
          if (!action.payload.notify) {
            return;
          }

          state.notifications.push({
            id: action.meta.requestId,
            message: action.payload.message,
            severity: "error",
          });
          return;
        }

        state.notifications.push({
          id: action.meta.requestId,
          message: action.error.message ?? "An unexpected error occurred.",
          severity: "error",
        });
      });
  },
});

export const { notificationDismissed, notificationEnqueued } =
  appStatusSlice.actions;

export const selectIsGlobalLoading = (state: RootState) =>
  Object.values(state.appStatus.requests).some(
    (request) => request.globalLoading
  );

export const selectNotifications = (state: RootState) =>
  state.appStatus.notifications;

export const appStatusReducer = appStatusSlice.reducer;
