import { notificationEnqueued } from "@/store/appStatus";
import type { AppDispatch } from "@/store";
import { toAppAsyncError } from "@/store/async";
import { createAppAsyncThunk } from "@/store/createAppAsyncThunk";

import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getMenuData,
  updateCategory,
  updateMenuItem,
} from "../api/menuApi";
import type {
  CategoryInput,
  MenuData,
  MenuItemInput,
  UpdateCategoryInput,
  UpdateMenuItemInput,
} from "../types/menu.types";

export const loadMenuData = createAppAsyncThunk<MenuData>(
  "menu/load",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getMenuData(signal);
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().menu.data.status !== "pending",
  }
);

const runMutation = async (
  mutation: () => Promise<void>,
  successMessage: string,
  signal: AbortSignal,
  dispatch: AppDispatch
) => {
  await mutation();
  const data = await getMenuData(signal);
  dispatch(notificationEnqueued(successMessage, "success"));
  return data;
};

export const addCategory = createAppAsyncThunk<MenuData, CategoryInput>(
  "menu/addCategory",
  async (input, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runMutation(
        () => createCategory(input),
        "Category created successfully.",
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);

export const editCategory = createAppAsyncThunk<MenuData, UpdateCategoryInput>(
  "menu/editCategory",
  async (input, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runMutation(
        () => updateCategory(input),
        "Category updated successfully.",
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);

export const removeCategory = createAppAsyncThunk<MenuData, number>(
  "menu/removeCategory",
  async (id, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runMutation(
        () => deleteCategory(id),
        "Category deleted successfully.",
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);

export const addMenuItem = createAppAsyncThunk<MenuData, MenuItemInput>(
  "menu/addMenuItem",
  async (input, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runMutation(
        () => createMenuItem(input),
        "Menu item created successfully.",
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);

export const editMenuItem = createAppAsyncThunk<MenuData, UpdateMenuItemInput>(
  "menu/editMenuItem",
  async (input, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runMutation(
        () => updateMenuItem(input),
        "Menu item updated successfully.",
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);

export const removeMenuItem = createAppAsyncThunk<MenuData, number>(
  "menu/removeMenuItem",
  async (id, { dispatch, rejectWithValue, signal }) => {
    try {
      return await runMutation(
        () => deleteMenuItem(id),
        "Menu item deleted successfully.",
        signal,
        dispatch
      );
    } catch (error) {
      return rejectWithValue(toAppAsyncError(error, { notify: false }));
    }
  }
);
