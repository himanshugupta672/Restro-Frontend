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

interface ConfirmDeleteDialogProps {
  description: string;
  error: AppAsyncError | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

export const ConfirmDeleteDialog = ({
  description,
  error,
  isDeleting,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmDeleteDialogProps) => (
  <Dialog
    fullWidth
    maxWidth="xs"
    onClose={isDeleting ? undefined : onClose}
    open={open}
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.message}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button disabled={isDeleting} onClick={onClose}>
        Cancel
      </Button>
      <Button
        color="error"
        disabled={isDeleting}
        onClick={onConfirm}
        startIcon={
          isDeleting ? <CircularProgress color="inherit" size={18} /> : null
        }
        variant="contained"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);
