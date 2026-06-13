import { createAsyncThunk } from "@reduxjs/toolkit";

import type { AppDispatch, RootState } from "@/store";

import type { AppAsyncError } from "./async/async.types";

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  dispatch: AppDispatch;
  rejectValue: AppAsyncError;
  state: RootState;
}>();
