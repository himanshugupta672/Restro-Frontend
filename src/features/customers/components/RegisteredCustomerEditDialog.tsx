import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { editCustomerSchema } from "../schemas/customerSchemas";
import type { RegisteredCustomer, EditCustomerInput } from "../types/adminCustomers.types";

interface RegisteredCustomerEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditCustomerInput) => Promise<void>;
  customer: RegisteredCustomer | null;
}

export const RegisteredCustomerEditDialog = ({
  open,
  onClose,
  onSubmit,
  customer,
}: RegisteredCustomerEditDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<any>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
    },
  });

  // Reset form when customer changes or modal opens
  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber || "",
          address: customer.address || "",
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          address: "",
        });
      }
    }
  }, [open, customer, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber || null,
      address: values.address || null,
    });
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Edit Customer Profile</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" noValidate spacing={2} sx={{ mt: 1 }}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.firstName)}
                fullWidth
                helperText={errors.firstName?.message as string | undefined}
                label="First Name"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.lastName)}
                fullWidth
                helperText={errors.lastName?.message as string | undefined}
                label="Last Name"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.email)}
                fullWidth
                helperText={errors.email?.message as string | undefined}
                label="Email Address"
                type="email"
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.phoneNumber)}
                fullWidth
                helperText={errors.phoneNumber?.message as string | undefined}
                label="Phone Number (optional)"
                type="tel"
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.address)}
                fullWidth
                helperText={errors.address?.message as string | undefined}
                label="Address (optional)"
                multiline
                rows={2}
                type="text"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSubmitting} onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={handleFormSubmit}
          variant="contained"
          color="primary"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
