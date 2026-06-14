import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

import type { MenuState } from "../types/menu.types";
import {
  addCategory,
  addMenuItem,
  editCategory,
  editMenuItem,
  loadMenuData,
  removeCategory,
  removeMenuItem,
} from "./menuThunks";

const initialState: MenuState = {
  data: {
    data: {
      categories: [],
      menuItems: [],
    },
    error: null,
    status: "idle",
  },
  mutationError: null,
  mutationStatus: "idle",
};

const mutationThunks = [
  addCategory,
  editCategory,
  removeCategory,
  addMenuItem,
  editMenuItem,
  removeMenuItem,
] as const;

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    mutationErrorCleared: (state) => {
      state.mutationError = null;
      state.mutationStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMenuData.pending, (state) => {
        state.data.error = null;
        state.data.status = "pending";
      })
      .addCase(loadMenuData.fulfilled, (state, action) => {
        state.data.data = action.payload;
        state.data.error = null;
        state.data.status = "succeeded";
      })
      .addCase(loadMenuData.rejected, (state, action) => {
        if (action.meta.condition) {
          return;
        }

        if (action.meta.aborted) {
          state.data.status =
            state.data.data.categories.length > 0 ||
            state.data.data.menuItems.length > 0
              ? "succeeded"
              : "idle";
          return;
        }

        state.data.error =
          action.payload ??
          ({
            message: action.error.message ?? "Could not load menu data.",
            notify: false,
          } as const);
        state.data.status = "failed";
      })
      .addMatcher(
        isAnyOf(...mutationThunks.map((thunk) => thunk.pending)),
        (state) => {
          state.mutationError = null;
          state.mutationStatus = "pending";
        }
      )
      .addMatcher(
        isAnyOf(...mutationThunks.map((thunk) => thunk.fulfilled)),
        (state, action) => {
          state.data.data = action.payload;
          state.data.status = "succeeded";
          state.mutationError = null;
          state.mutationStatus = "succeeded";
        }
      )
      .addMatcher(
        isAnyOf(...mutationThunks.map((thunk) => thunk.rejected)),
        (state, action) => {
          if (action.meta.aborted || action.meta.condition) {
            state.mutationStatus = "idle";
            return;
          }

          state.mutationError =
            action.payload ??
            ({
              message: action.error.message ?? "The change could not be saved.",
              notify: false,
            } as const);
          state.mutationStatus = "failed";
        }
      );
  },
});

export const { mutationErrorCleared } = menuSlice.actions;

export const selectMenuData = (state: RootState) => state.menu.data;
export const selectMenuMutationError = (state: RootState) =>
  state.menu.mutationError;
export const selectMenuMutationStatus = (state: RootState) =>
  state.menu.mutationStatus;

export const menuReducer = menuSlice.reducer;
