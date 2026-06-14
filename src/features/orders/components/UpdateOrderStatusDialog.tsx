import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import type { AppAsyncError } from "@/store";
import type { OrderStatus } from "@/types/order";

import type { Order } from "../types/order.types";
import { getAdminStatusOptions } from "../utils/orderWorkflow";

interface UpdateOrderStatusDialogProps {
  error: AppAsyncError | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (status: OrderStatus) => Promise<boolean>;
  open: boolean;
  order: Order | null;
}

export const UpdateOrderStatusDialog = ({
  error,
  isSubmitting,
  onClose,
  onSubmit,
  open,
  order,
}: UpdateOrderStatusDialogProps) => {
  const options = order ? getAdminStatusOptions(order.status) : [];
  const [status, setStatus] = useState<OrderStatus | "">(options[0] ?? "");

  const handleSubmit = async () => {
    if (status && (await onSubmit(status))) {
      onClose();
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <DialogTitle>Update order #{order?.id}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error.message}</Alert>}
          {options.length === 0 ? (
            <Typography color="text.secondary">
              This order has reached a terminal status.
            </Typography>
          ) : (
            <TextField
              disabled={isSubmitting}
              label="New status"
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
              select
              value={status}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || !status}
          onClick={handleSubmit}
          startIcon={
            isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
          }
          variant="contained"
        >
          {isSubmitting ? "Updating..." : "Update status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
