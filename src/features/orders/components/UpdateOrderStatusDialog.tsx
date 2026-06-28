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

import type { ChefOption, Order } from "../types/order.types";
import { getAdminStatusOptions } from "../utils/orderWorkflow";

interface UpdateOrderStatusDialogProps {
  availableChefs: ChefOption[];
  chefs: ChefOption[];
  error: AppAsyncError | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: { chefId: number | null; status: OrderStatus }) => Promise<boolean>;
  open: boolean;
  order: Order | null;
}

export const UpdateOrderStatusDialog = ({
  availableChefs,
  chefs,
  error,
  isSubmitting,
  onClose,
  onSubmit,
  open,
  order,
}: UpdateOrderStatusDialogProps) => {
  const nextStatusOptions = order ? getAdminStatusOptions(order.status) : [];
  const options = order && nextStatusOptions.length > 0
    ? [order.status, ...nextStatusOptions]
    : [];
  const [status, setStatus] = useState<OrderStatus | "">(order?.status ?? "");
  const [chefId, setChefId] = useState<number | "">(order?.chefId ?? "");
  const selectedStatusRequiresChef =
    status === "Assigned" ||
    status === "Accepted" ||
    status === "Preparing" ||
    status === "Ready";
  const assignedChef =
    order?.chefId != null
      ? chefs.find((chef) => chef.id === order.chefId) ?? null
      : null;
  const chefOptions = assignedChef
    ? [
        assignedChef,
        ...availableChefs.filter((chef) => chef.id !== assignedChef.id),
      ]
    : availableChefs;
  const selectedChefUnavailable =
    assignedChef != null &&
    !availableChefs.some((chef) => chef.id === assignedChef.id);
  const validationMessage =
    selectedStatusRequiresChef &&
    assignedChef &&
    !assignedChef.isActive &&
    chefId === assignedChef.id
      ? "The assigned chef is inactive. Choose an active available chef."
      : selectedStatusRequiresChef && !chefId
        ? "Select an available chef before using this status."
        : null;

  const handleSubmit = async () => {
    if (
      status &&
      !validationMessage &&
      (await onSubmit({ chefId: chefId === "" ? null : chefId, status }))
    ) {
      onClose();
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <DialogTitle>Update order #{order?.id}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error.message}</Alert>}
          {selectedChefUnavailable && assignedChef && (
            <Alert severity="warning">
              {assignedChef.name} is already assigned to this order but is not
              currently available for new assignments.
            </Alert>
          )}
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
          <TextField
            disabled={isSubmitting || options.length === 0}
            helperText={
              availableChefs.length === 0 && !assignedChef
                ? "No active and available chefs are currently available."
                : validationMessage ?? "Only active and available chefs can be assigned."
            }
            label="Assign chef"
            onChange={(event) => {
              const value = event.target.value;
              setChefId(value === "" ? "" : Number(value));
            }}
            select
            value={chefId}
          >
            <MenuItem value="">
              {selectedStatusRequiresChef ? "Select a chef" : "Unassigned"}
            </MenuItem>
            {chefOptions.map((chef) => {
              const unavailable =
                chef.id === assignedChef?.id && selectedChefUnavailable;

              return (
                <MenuItem disabled={unavailable} key={chef.id} value={chef.id}>
                  {chef.name} - {chef.status}
                </MenuItem>
              );
            })}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || !status || Boolean(validationMessage)}
          onClick={handleSubmit}
          startIcon={
            isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
          }
          variant="contained"
        >
          {isSubmitting ? "Updating..." : "Update order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
