import { zodResolver } from "@hookform/resolvers/zod";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { signup } from "../api/authApi";
import { signupSchema, type SignupFormValues } from "../schemas/signupSchema";

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await signup(values);
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.login);
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || "Registration failed.";
      setError(msg);
    }
  });

  return (
    <Stack spacing={3}>
      <Avatar sx={{ bgcolor: "success.main" }}>
        <PersonAddOutlinedIcon />
      </Avatar>
      <Stack spacing={1}>
        <Typography component="h1" variant="h4">
          Create Account
        </Typography>
        <Typography color="text.secondary">
          Register to join the restaurant staff as a Chef.
        </Typography>
      </Stack>

      {success && (
        <Alert severity="success">
          Account created successfully! Redirecting to sign in...
        </Alert>
      )}

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              {...field}
              autoComplete="name"
              autoFocus
              disabled={isSubmitting || success}
              error={Boolean(errors.name)}
              fullWidth
              helperText={errors.name?.message}
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
              autoComplete="email"
              disabled={isSubmitting || success}
              error={Boolean(errors.email)}
              fullWidth
              helperText={errors.email?.message}
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
              autoComplete="tel"
              disabled={isSubmitting || success}
              error={Boolean(errors.phoneNumber)}
              fullWidth
              helperText={errors.phoneNumber?.message}
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
              autoComplete="street-address"
              disabled={isSubmitting || success}
              error={Boolean(errors.address)}
              fullWidth
              helperText={errors.address?.message}
              label="Address (optional)"
              multiline
              rows={2}
              type="text"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              {...field}
              autoComplete="new-password"
              disabled={isSubmitting || success}
              error={Boolean(errors.password)}
              fullWidth
              helperText={errors.password?.message}
              label="Password"
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
              autoComplete="new-password"
              disabled={isSubmitting || success}
              error={Boolean(errors.confirmPassword)}
              fullWidth
              helperText={errors.confirmPassword?.message}
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
        <Button
          disabled={isSubmitting || success}
          fullWidth
          size="large"
          startIcon={
            isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
          }
          type="submit"
          variant="contained"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </Button>
      </Stack>

      <Typography align="center" variant="body2">
        Already have an account?{" "}
        <Link component={RouterLink} to={ROUTES.login}>
          Sign In
        </Link>
      </Typography>
    </Stack>
  );
};
