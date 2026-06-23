import { zodResolver } from "@hookform/resolvers/zod";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import {
  loginErrorCleared,
  selectLoginError,
  selectLoginStatus,
} from "../store/authSlice";
import { loginUser } from "../store/authThunks";

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const loginError = useAppSelector(selectLoginError);
  const loginStatus = useAppSelector(selectLoginStatus);
  const isSubmitting = loginStatus === "pending";
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    dispatch(loginErrorCleared());
  }, [dispatch]);

  const handleLogin = handleSubmit(async (values) => {
    const result = await dispatch(loginUser(values));

    if (loginUser.fulfilled.match(result)) {
      reset({
        email: values.email,
        password: "",
      });
    }
  });

  return (
    <Stack spacing={3}>
      <Avatar sx={{ bgcolor: "primary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Stack spacing={1}>
        <Typography component="h1" variant="h4">
          Sign in
        </Typography>
        <Typography color="text.secondary">
          Use your restaurant management account.
        </Typography>
      </Stack>

      {loginError && (
        <Alert severity="error">
          {loginError.message}
          {loginError.traceId && (
            <Typography sx={{ display: "block" }} variant="caption">
              Reference: {loginError.traceId}
            </Typography>
          )}
        </Alert>
      )}

      <Stack component="form" noValidate onSubmit={handleLogin} spacing={2}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              {...field}
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
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
          name="password"
          render={({ field }) => (
            <TextField
              {...field}
              autoComplete="current-password"
              disabled={isSubmitting}
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
        <Button
          disabled={isSubmitting}
          fullWidth
          size="large"
          startIcon={
            isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
          }
          type="submit"
          variant="contained"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </Stack>

      <Typography align="center" variant="body2">
        Don't have an account?{" "}
        <Link component={RouterLink} to={ROUTES.signup}>
          Create one
        </Link>
      </Typography>
    </Stack>
  );
};
