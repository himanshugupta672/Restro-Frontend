import type {
  AvailabilityFilter,
  Category,
  MenuItem,
} from "../types/menu.types";

interface MenuFilters {
  availability: AvailabilityFilter;
  categoryId: number | "all";
  search: string;
}

export const filterMenuItems = (
  menuItems: MenuItem[],
  filters: MenuFilters
) => {
  const search = filters.search.trim().toLowerCase();

  return menuItems.filter((menuItem) => {
    const matchesSearch =
      search.length === 0 ||
      menuItem.name.toLowerCase().includes(search) ||
      menuItem.description.toLowerCase().includes(search);
    const matchesCategory =
      filters.categoryId === "all" ||
      menuItem.categoryId === filters.categoryId;
    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "available" && menuItem.isAvailable) ||
      (filters.availability === "unavailable" && !menuItem.isAvailable);

    return matchesSearch && matchesCategory && matchesAvailability;
  });
};

export const getCategoryName = (categories: Category[], categoryId: number) =>
  categories.find((category) => category.id === categoryId)?.name ??
  "Uncategorized";
