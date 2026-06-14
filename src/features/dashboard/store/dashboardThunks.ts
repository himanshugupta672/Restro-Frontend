import type { UserRole } from "@/features/auth";
import { toAppAsyncError } from "@/store/async";
import { createAppAsyncThunk } from "@/store/createAppAsyncThunk";

import { getDashboard } from "../api/dashboardApi";
import type { DashboardData } from "../types/dashboard.types";

export const loadDashboard = createAppAsyncThunk<DashboardData, UserRole>(
  "dashboard/load",
  async (role, { rejectWithValue, signal }) => {
    try {
      return await getDashboard(role, signal);
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().dashboard.overview.status !== "pending",
  }
);
