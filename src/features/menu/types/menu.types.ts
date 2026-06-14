import type { AppAsyncError, AsyncState, AsyncStatus } from "@/store";

export interface Category {
  displayOrder: number;
  id: number;
  name: string;
}

export interface MenuItem {
  categoryId: number;
  description: string;
  id: number;
  imageUrl: string | null;
  isAvailable: boolean;
  name: string;
  prepTimeMinutes: number;
  price: number;
}

export interface MenuData {
  categories: Category[];
  menuItems: MenuItem[];
}

export interface CategoryInput {
  displayOrder: number;
  name: string;
}

export interface UpdateCategoryInput extends CategoryInput {
  id: number;
}

export interface MenuItemInput {
  categoryId: number;
  description: string;
  imageUrl: string | null;
  isAvailable: boolean;
  name: string;
  prepTimeMinutes: number;
  price: number;
}

export interface UpdateMenuItemInput extends MenuItemInput {
  id: number;
}

export interface MenuState {
  data: AsyncState<MenuData>;
  mutationError: AppAsyncError | null;
  mutationStatus: AsyncStatus;
}

export type AvailabilityFilter = "all" | "available" | "unavailable";
