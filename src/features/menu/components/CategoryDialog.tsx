import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import type { AppAsyncError } from "@/store";

import {
  categoryFormSchema,
  type CategoryFormValues,
} from "../schemas/menuSchemas";
import type { Category } from "../types/menu.types";

interface CategoryDialogProps {
  category: Category | null;
  error: AppAsyncError | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<boolean>;
  open: boolean;
}

const getDefaultValues = (category: Category | null): CategoryFormValues => ({
  displayOrder: category?.displayOrder ?? 0,
  name: category?.name ?? "",
});

export const CategoryDialog = ({
  category,
  error,
  isSubmitting,
  onClose,
  onSubmit,
  open,
}: CategoryDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: getDefaultValues(category),
    resolver: zodResolver(categoryFormSchema),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(category));
    }
  }, [category, open, reset]);

  const handleSave = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      onClose();
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <DialogTitle>{category ? "Edit category" : "Add category"}</DialogTitle>
      <Stack component="form" noValidate onSubmit={handleSave}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error.message}</Alert>}
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  disabled={isSubmitting}
                  error={Boolean(errors.name)}
                  fullWidth
                  helperText={errors.name?.message}
                  label="Category name"
                />
              )}
            />
            <Controller
              control={control}
              name="displayOrder"
              render={({ field }) => (
                <TextField
                  {...field}
                  disabled={isSubmitting}
                  error={Boolean(errors.displayOrder)}
                  fullWidth
                  helperText={
                    errors.displayOrder?.message ??
                    "Lower values appear first in category lists."
                  }
                  label="Display order"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                  slotProps={{ htmlInput: { min: 0 } }}
                  type="number"
                />
              )}
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
            {isSubmitting ? "Saving..." : "Save category"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
