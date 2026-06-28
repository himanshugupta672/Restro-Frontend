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
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { normalizeApiError } from "@/services/api";
import {
  createTableSchema,
  type CreateTableFormValues,
} from "../schemas/tableSchemas";
import type { RestaurantTable } from "../types/tables.types";

interface TableFormDialogProps {
  existingTableNumbers: number[];
  onClose: () => void;
  onSubmit: (values: CreateTableFormValues) => Promise<void>;
  open: boolean;
  table: RestaurantTable | null;
}

export const TableFormDialog = ({
  existingTableNumbers,
  onClose,
  onSubmit,
  open,
  table,
}: TableFormDialogProps) => {
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTableFormValues>({
    defaultValues: {
      tableNumber: 1,
      isActive: true,
    },
    resolver: zodResolver(createTableSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        tableNumber: table?.tableNumber ?? 1,
        isActive: table?.isActive ?? true,
      });
      setError(null);
    }
  }, [open, reset, table]);

  const submit = handleSubmit(async (values) => {
    setError(null);

    const isDuplicate = existingTableNumbers
      .filter((tableNumber) => tableNumber !== table?.tableNumber)
      .includes(values.tableNumber);

    if (isDuplicate) {
      setFieldError("tableNumber", {
        message: "A table with this number already exists.",
      });
      return;
    }

    try {
      await onSubmit(values);
    } catch (err: unknown) {
      setError(normalizeApiError(err).message);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <DialogTitle>{table ? "Edit Table" : "Add Table"}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="table-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Controller
            control={control}
            name="tableNumber"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.tableNumber)}
                fullWidth
                helperText={errors.tableNumber?.message}
                label="Table number"
                onChange={(event) => field.onChange(Number(event.target.value))}
                type="number"
              />
            )}
          />
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                }
                label="Active status"
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
          form="table-form"
          startIcon={
            isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
          }
          type="submit"
          variant="contained"
        >
          {isSubmitting
            ? table
              ? "Saving..."
              : "Adding..."
            : table
              ? "Save Changes"
              : "Add Table"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
