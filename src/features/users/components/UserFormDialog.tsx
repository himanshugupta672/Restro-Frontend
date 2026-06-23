import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
} from "../schemas/userSchema";
import type { User } from "../types/users.types";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user: User | null;
}

const getRoleValue = (roleStr: User["role"]) => {
  switch (roleStr) {
    case "Admin":
      return 0;
    case "Chef":
      return 1;
    case "Customer":
      return 2;
    default:
      return 1;
  }
};

export const UserFormDialog = ({
  open,
  onClose,
  onSubmit,
  user,
}: UserFormDialogProps) => {
  const isEdit = Boolean(user);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? adminUpdateUserSchema : adminCreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      role: 1, // Default to Chef
      password: "",
      confirmPassword: "",
    },
  });

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          address: user.address || "",
          role: getRoleValue(user.role),
          password: "",
          confirmPassword: "",
        });
      } else {
        reset({
          name: "",
          email: "",
          phoneNumber: "",
          address: "",
          role: 1,
          password: "",
          confirmPassword: "",
        });
      }
      // Reset visibility toggles when modal changes state
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, user, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      phoneNumber: values.phoneNumber || null,
      address: values.address || null,
      role: Number(values.role),
      password: values.password || null,
    };

    if (!isEdit) {
      (payload as any).confirmPassword = values.confirmPassword;
    }

    await onSubmit(payload);
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>{isEdit ? "Edit User Details" : "Create New User"}</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" noValidate spacing={2} sx={{ mt: 1 }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.name)}
                fullWidth
                helperText={errors.name?.message as string | undefined}
                label="Full name"
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
                label="Email address"
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
                label="Phone number (optional)"
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

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <FormControl error={Boolean(errors.role)} fullWidth>
                <InputLabel id="user-role-label">System Role</InputLabel>
                <Select
                  {...field}
                  disabled={isSubmitting}
                  label="System Role"
                  labelId="user-role-label"
                >
                  <MenuItem value={1}>Chef</MenuItem>
                  <MenuItem value={0}>Admin</MenuItem>
                </Select>
                {errors.role?.message && (
                  <FormHelperText>{errors.role.message as string}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.password)}
                fullWidth
                helperText={
                  (errors.password?.message as string | undefined) ||
                  (isEdit ? "Leave blank to keep current password." : "")
                }
                label={isEdit ? "New Password" : "Password"}
                type={showPassword ? "text" : "password"}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                error={Boolean(errors.confirmPassword)}
                fullWidth
                helperText={errors.confirmPassword?.message as string | undefined}
                label="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
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
        >
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
