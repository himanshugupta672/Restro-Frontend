import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { CategoryDialog } from "../components/CategoryDialog";
import { CategoryManager } from "../components/CategoryManager";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { MenuFilters } from "../components/MenuFilters";
import { MenuItemDialog } from "../components/MenuItemDialog";
import { MenuItemTable } from "../components/MenuItemTable";
import type {
  CategoryFormValues,
  MenuItemFormValues,
} from "../schemas/menuSchemas";
import {
  mutationErrorCleared,
  selectMenuData,
  selectMenuMutationError,
  selectMenuMutationStatus,
} from "../store/menuSlice";
import {
  addCategory,
  addMenuItem,
  editCategory,
  editMenuItem,
  loadMenuData,
  removeCategory,
  removeMenuItem,
} from "../store/menuThunks";
import type {
  AvailabilityFilter,
  Category,
  MenuItem,
} from "../types/menu.types";
import { filterMenuItems } from "../utils/menuFilters";

export const MenuPage = () => {
  const dispatch = useAppDispatch();
  const menuData = useAppSelector(selectMenuData);
  const mutationError = useAppSelector(selectMenuMutationError);
  const mutationStatus = useAppSelector(selectMenuMutationStatus);
  const isMutating = mutationStatus === "pending";
  const isLoading = menuData.status === "pending";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(
    null
  );

  useEffect(() => {
    const request = dispatch(loadMenuData());
    return () => request.abort();
  }, [dispatch]);

  const filteredMenuItems = useMemo(
    () =>
      filterMenuItems(menuData.data.menuItems, {
        availability: availabilityFilter,
        categoryId: categoryFilter,
        search,
      }),
    [availabilityFilter, categoryFilter, menuData.data.menuItems, search]
  );

  const menuItemCounts = useMemo(
    () =>
      menuData.data.menuItems.reduce<Record<number, number>>(
        (counts, menuItem) => {
          counts[menuItem.categoryId] = (counts[menuItem.categoryId] ?? 0) + 1;
          return counts;
        },
        {}
      ),
    [menuData.data.menuItems]
  );

  const clearMutationError = () => {
    dispatch(mutationErrorCleared());
  };

  const openAddCategory = () => {
    clearMutationError();
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: Category) => {
    clearMutationError();
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const openAddMenuItem = () => {
    clearMutationError();
    setSelectedMenuItem(null);
    setMenuItemDialogOpen(true);
  };

  const openEditMenuItem = (menuItem: MenuItem) => {
    clearMutationError();
    setSelectedMenuItem(menuItem);
    setMenuItemDialogOpen(true);
  };

  const handleCategorySubmit = async (values: CategoryFormValues) => {
    const result = selectedCategory
      ? await dispatch(editCategory({ ...values, id: selectedCategory.id }))
      : await dispatch(addCategory(values));

    return addCategory.fulfilled.match(result) ||
      editCategory.fulfilled.match(result)
      ? true
      : false;
  };

  const handleMenuItemSubmit = async (values: MenuItemFormValues) => {
    const input = {
      ...values,
      imageUrl: values.imageUrl || null,
    };
    const result = selectedMenuItem
      ? await dispatch(editMenuItem({ ...input, id: selectedMenuItem.id }))
      : await dispatch(addMenuItem(input));

    return addMenuItem.fulfilled.match(result) ||
      editMenuItem.fulfilled.match(result)
      ? true
      : false;
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    const result = await dispatch(removeCategory(categoryToDelete.id));
    if (removeCategory.fulfilled.match(result)) {
      setCategoryToDelete(null);
    }
  };

  const handleDeleteMenuItem = async () => {
    if (!menuItemToDelete) {
      return;
    }

    const result = await dispatch(removeMenuItem(menuItemToDelete.id));
    if (removeMenuItem.fulfilled.match(result)) {
      setMenuItemToDelete(null);
    }
  };

  const handleRefresh = () => {
    void dispatch(loadMenuData());
  };

  const isInitialLoading =
    menuData.status === "idle" ||
    (isLoading &&
      menuData.data.categories.length === 0 &&
      menuData.data.menuItems.length === 0);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h4">
            Menu management
          </Typography>
          <Typography color="text.secondary">
            Manage categories, dishes, pricing, availability, and preparation
            details.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            disabled={isLoading}
            onClick={handleRefresh}
            startIcon={
              isLoading ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <RefreshOutlinedIcon />
              )
            }
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            disabled={menuData.data.categories.length === 0}
            onClick={openAddMenuItem}
            startIcon={<AddOutlinedIcon />}
            variant="contained"
          >
            Add menu item
          </Button>
        </Stack>
      </Stack>

      {menuData.error && (
        <Alert
          action={
            <Button color="inherit" onClick={handleRefresh} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          {menuData.error.message}
        </Alert>
      )}

      {isInitialLoading ? (
        <Paper
          elevation={0}
          sx={{
            alignItems: "center",
            border: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            minHeight: 320,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary">
              Loading menu management...
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            <SummaryCard
              label="Categories"
              value={menuData.data.categories.length}
            />
            <SummaryCard
              label="Menu items"
              value={menuData.data.menuItems.length}
            />
            <SummaryCard
              label="Available now"
              value={
                menuData.data.menuItems.filter((item) => item.isAvailable)
                  .length
              }
            />
          </Box>

          <CategoryManager
            categories={menuData.data.categories}
            menuItemCounts={menuItemCounts}
            onAdd={openAddCategory}
            onDelete={(category) => {
              clearMutationError();
              setCategoryToDelete(category);
            }}
            onEdit={openEditCategory}
          />

          <Stack component="section" spacing={2}>
            <Stack spacing={0.5}>
              <Typography component="h2" variant="h6">
                Menu items
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Showing {filteredMenuItems.length} of{" "}
                {menuData.data.menuItems.length} items.
              </Typography>
            </Stack>
            <MenuFilters
              availability={availabilityFilter}
              categories={menuData.data.categories}
              categoryId={categoryFilter}
              onAvailabilityChange={setAvailabilityFilter}
              onCategoryChange={setCategoryFilter}
              onSearchChange={setSearch}
              search={search}
            />
            <MenuItemTable
              categories={menuData.data.categories}
              menuItems={filteredMenuItems}
              onDelete={(menuItem) => {
                clearMutationError();
                setMenuItemToDelete(menuItem);
              }}
              onEdit={openEditMenuItem}
            />
          </Stack>
        </>
      )}

      <CategoryDialog
        category={selectedCategory}
        error={mutationError}
        isSubmitting={isMutating}
        onClose={() => {
          if (!isMutating) {
            setCategoryDialogOpen(false);
            clearMutationError();
          }
        }}
        onSubmit={handleCategorySubmit}
        open={categoryDialogOpen}
      />

      <MenuItemDialog
        categories={menuData.data.categories}
        error={mutationError}
        isSubmitting={isMutating}
        menuItem={selectedMenuItem}
        onClose={() => {
          if (!isMutating) {
            setMenuItemDialogOpen(false);
            clearMutationError();
          }
        }}
        onSubmit={handleMenuItemSubmit}
        open={menuItemDialogOpen}
      />

      <ConfirmDeleteDialog
        description={
          categoryToDelete
            ? `Delete the "${categoryToDelete.name}" category? This action cannot be undone.`
            : ""
        }
        error={mutationError}
        isDeleting={isMutating}
        onClose={() => {
          if (!isMutating) {
            setCategoryToDelete(null);
            clearMutationError();
          }
        }}
        onConfirm={handleDeleteCategory}
        open={Boolean(categoryToDelete)}
        title="Delete category"
      />

      <ConfirmDeleteDialog
        description={
          menuItemToDelete
            ? `Delete "${menuItemToDelete.name}" from the menu? This action cannot be undone.`
            : ""
        }
        error={mutationError}
        isDeleting={isMutating}
        onClose={() => {
          if (!isMutating) {
            setMenuItemToDelete(null);
            clearMutationError();
          }
        }}
        onConfirm={handleDeleteMenuItem}
        open={Boolean(menuItemToDelete)}
        title="Delete menu item"
      />
    </Stack>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
}

const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2.5 }}>
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700 }} variant="h4">
      {value}
    </Typography>
  </Paper>
);
