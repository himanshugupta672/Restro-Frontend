import { zodResolver } from "@hookform/resolvers/zod";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  selectCurrentUser,
  sessionCleared,
  sessionEstablished,
  USER_ROLES,
} from "@/features/auth";
import { normalizeApiError } from "@/services/api";
import {
  registerCustomerAccount,
  type CustomerRegisterPayload,
} from "../api/customerAuthApi";
import { customerTableNumberSet } from "../store/customerOrderingSlice";

const getCustomerRedirectTarget = (
  redirect: string | null,
  table: string | null
) => {
  const target = redirect?.startsWith("/customer")
    ? redirect
    : ROUTES.customerMenu;

  if (!table || target.includes("?")) {
    return target;
  }

  return `${target}?table=${table}`;
};

const customerSignupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters."),
    lastName: z.string().min(2, "Last name must be at least 2 characters."),
    email: z.string().email("Enter a valid email address."),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type CustomerSignupFormValues = z.infer<typeof customerSignupSchema>;

export const CustomerSignUpPage = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("table");
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== USER_ROLES.customer) {
        dispatch(sessionCleared());
      } else {
        const target = getCustomerRedirectTarget(redirect, table);
        navigate(target, { replace: true });
      }
    }
  }, [currentUser, dispatch, redirect, table, navigate]);

  useEffect(() => {
    if (!table) {
      return;
    }

    const tableNumber = Number(table);
    if (Number.isInteger(tableNumber) && tableNumber > 0) {
      dispatch(customerTableNumberSet(tableNumber));
    }
  }, [dispatch, table]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<CustomerSignupFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(customerSignupSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const payload: CustomerRegisterPayload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      if (values.phoneNumber) {
        payload.phoneNumber = values.phoneNumber;
      }
      const result = await registerCustomerAccount(payload);

      setSuccess(true);
      dispatch(
        sessionEstablished({
          accessToken: result.accessToken,
          user: {
            id: result.userId,
            email: values.email,
            role: result.role,
          },
        })
      );

      setTimeout(() => {
        const target = getCustomerRedirectTarget(redirect, table);
        navigate(target, { replace: true });
      }, 1500);
    } catch (err: unknown) {
      setError(normalizeApiError(err).message);
    }
  });

  return (
    <Stack spacing={3}>
      <Avatar sx={{ bgcolor: "success.main", mx: "auto" }}>
        <PersonAddOutlinedIcon />
      </Avatar>
      <Stack spacing={1} sx={{ textAlign: "center" }}>
        <Typography component="h1" variant="h4">
          Create Account
        </Typography>
        <Typography color="text.secondary">
          Sign up to place orders and track your order history.
        </Typography>
        {table && (
          <Typography
            color="primary"
            sx={{ fontWeight: 600 }}
            variant="subtitle2"
          >
            Table: {table}
          </Typography>
        )}
      </Stack>

      {success && (
        <Alert severity="success">
          Account created successfully! Auto-logging in...
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
        <Stack direction="row" spacing={2}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting || success}
                error={Boolean(errors.firstName)}
                fullWidth
                helperText={errors.firstName?.message as string | undefined}
                label="First name"
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
                disabled={isSubmitting || success}
                error={Boolean(errors.lastName)}
                fullWidth
                helperText={errors.lastName?.message as string | undefined}
                label="Last name"
                type="text"
              />
            )}
          />
        </Stack>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              {...field}
              disabled={isSubmitting || success}
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
              disabled={isSubmitting || success}
              error={Boolean(errors.phoneNumber)}
              fullWidth
              helperText={errors.phoneNumber?.message as string | undefined}
              label="Mobile number (optional)"
              type="tel"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              {...field}
              disabled={isSubmitting || success}
              error={Boolean(errors.password)}
              fullWidth
              helperText={errors.password?.message as string | undefined}
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
              disabled={isSubmitting || success}
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
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
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
        <Link
          component={RouterLink}
          to={`${ROUTES.customerLogin}?redirect=${encodeURIComponent(
            redirect ?? ROUTES.customerMenu
          )}${table ? `&table=${table}` : ""}`}
        >
          Sign In
        </Link>
      </Typography>
    </Stack>
  );
};
