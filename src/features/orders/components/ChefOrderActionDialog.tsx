import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import type { AppAsyncError } from "@/store";

import type { Order } from "../types/order.types";

interface ChefOrderActionDialogProps {
  action: "accept" | "reject" | null;
  error: AppAsyncError | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: Order | null;
}

export const ChefOrderActionDialog = ({
  action,
  error,
  isSubmitting,
  onClose,
  onConfirm,
  order,
}: ChefOrderActionDialogProps) => {
  const open = Boolean(action && order);
  const isAccept = action === "accept";

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <DialogTitle>
        {isAccept ? "Accept order" : "Reject order"} #{order?.id}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isAccept
            ? "Accept this order and assign it to your kitchen queue?"
            : "Return this order to the pending queue for another chef?"}
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          color={isAccept ? "primary" : "warning"}
          disabled={isSubmitting}
          onClick={onConfirm}
          startIcon={
            isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
          }
          variant="contained"
        >
          {isSubmitting ? "Updating..." : isAccept ? "Accept" : "Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
