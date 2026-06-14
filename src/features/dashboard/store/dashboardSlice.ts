import { createSlice } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

import type { DashboardState } from "../types/dashboard.types";
import { loadDashboard } from "./dashboardThunks";

const initialState: DashboardState = {
  overview: {
    data: null,
    error: null,
    status: "idle",
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => {
        state.overview.error = null;
        state.overview.status = "pending";
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.overview.data = action.payload;
        state.overview.error = null;
        state.overview.status = "succeeded";
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        if (action.meta.aborted) {
          state.overview.status = state.overview.data ? "succeeded" : "idle";
          return;
        }

        state.overview.error =
          action.payload ??
          ({
            message: action.error.message ?? "Could not load the dashboard.",
            notify: false,
          } as const);
        state.overview.status = "failed";
      });
  },
});

export const selectDashboardOverview = (state: RootState) =>
  state.dashboard.overview;

export const dashboardReducer = dashboardSlice.reducer;
