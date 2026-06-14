import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem as MuiMenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
} from "react-hook-form";

import type { AppAsyncError } from "@/store";

import {
  menuItemFormSchema,
  type MenuItemFormValues,
} from "../schemas/menuSchemas";
import type { Category, MenuItem } from "../types/menu.types";

interface MenuItemDialogProps {
  categories: Category[];
  error: AppAsyncError | null;
  isSubmitting: boolean;
  menuItem: MenuItem | null;
  onClose: () => void;
  onSubmit: (values: MenuItemFormValues) => Promise<boolean>;
  open: boolean;
}

const getDefaultValues = (
  menuItem: MenuItem | null,
  categories: Category[]
): MenuItemFormValues => ({
  categoryId: menuItem?.categoryId ?? categories[0]?.id ?? 0,
  description: menuItem?.description ?? "",
  imageUrl: menuItem?.imageUrl ?? "",
  isAvailable: menuItem?.isAvailable ?? true,
  name: menuItem?.name ?? "",
  prepTimeMinutes: menuItem?.prepTimeMinutes ?? 0,
  price: menuItem?.price ?? 0,
});

export const MenuItemDialog = ({
  categories,
  error,
  isSubmitting,
  menuItem,
  onClose,
  onSubmit,
  open,
}: MenuItemDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    defaultValues: getDefaultValues(menuItem, categories),
    resolver: zodResolver(menuItemFormSchema),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(menuItem, categories));
    }
  }, [categories, menuItem, open, reset]);

  const handleSave = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      onClose();
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <DialogTitle>{menuItem ? "Edit menu item" : "Add menu item"}</DialogTitle>
      <Stack component="form" noValidate onSubmit={handleSave}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error.message}</Alert>}
            <BoxFields
              categories={categories}
              control={control}
              disabled={isSubmitting}
              errors={errors}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress color="inherit" size={18} />
              ) : null
            }
            type="submit"
            variant="contained"
          >
            {isSubmitting ? "Saving..." : "Save menu item"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};

interface BoxFieldsProps {
  categories: Category[];
  control: Control<MenuItemFormValues>;
  disabled: boolean;
  errors: FieldErrors<MenuItemFormValues>;
}

const BoxFields = ({
  categories,
  control,
  disabled,
  errors,
}: BoxFieldsProps) => (
  <>
    <Controller
      control={control}
      name="name"
      render={({ field }) => (
        <TextField
          {...field}
          autoFocus
          disabled={disabled}
          error={Boolean(errors.name)}
          fullWidth
          helperText={errors.name?.message}
          label="Item name"
        />
      )}
    />
    <Controller
      control={control}
      name="description"
      render={({ field }) => (
        <TextField
          {...field}
          disabled={disabled}
          error={Boolean(errors.description)}
          fullWidth
          helperText={errors.description?.message}
          label="Description"
          minRows={3}
          multiline
        />
      )}
    />
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <TextField
            {...field}
            disabled={disabled}
            error={Boolean(errors.categoryId)}
            fullWidth
            helperText={errors.categoryId?.message}
            label="Category"
            onChange={(event) => field.onChange(Number(event.target.value))}
            select
          >
            {categories.map((category) => (
              <MuiMenuItem key={category.id} value={category.id}>
                {category.name}
              </MuiMenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        control={control}
        name="price"
        render={({ field }) => (
          <TextField
            {...field}
            disabled={disabled}
            error={Boolean(errors.price)}
            fullWidth
            helperText={errors.price?.message}
            label="Price"
            onChange={(event) => field.onChange(Number(event.target.value))}
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            type="number"
          />
        )}
      />
      <Controller
        control={control}
        name="prepTimeMinutes"
        render={({ field }) => (
          <TextField
            {...field}
            disabled={disabled}
            error={Boolean(errors.prepTimeMinutes)}
            fullWidth
            helperText={errors.prepTimeMinutes?.message}
            label="Preparation time"
            onChange={(event) => field.onChange(Number(event.target.value))}
            slotProps={{ htmlInput: { min: 0 } }}
            type="number"
          />
        )}
      />
    </Stack>
    <Controller
      control={control}
      name="imageUrl"
      render={({ field }) => (
        <TextField
          {...field}
          disabled={disabled}
          error={Boolean(errors.imageUrl)}
          fullWidth
          helperText={
            errors.imageUrl?.message ?? "Optional URL for the item image."
          }
          label="Image URL"
        />
      )}
    />
    <Controller
      control={control}
      name="isAvailable"
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={field.value}
              disabled={disabled}
              onChange={(_, checked) => field.onChange(checked)}
            />
          }
          label="Available for ordering"
        />
      )}
    />
  </>
);
