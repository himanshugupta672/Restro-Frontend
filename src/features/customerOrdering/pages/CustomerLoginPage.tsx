import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  selectCurrentUser,
  sessionCleared,
  sessionEstablished,
  USER_ROLES,
} from "@/features/auth";
import { login } from "@/features/auth/api/authApi";
import { normalizeApiError } from "@/services/api";
import { sendOtpCode, verifyOtpCode } from "../api/customerAuthApi";
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

export const CustomerLoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

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

  const [activeTab, setActiveTab] = useState<number>(0); // 0: Email, 1: OTP
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Email/Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [otpType, setOtpType] = useState<"email" | "phone">("email");
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await login({ email, password });
      dispatch(
        sessionEstablished({
          accessToken: result.accessToken,
          user: {
            id: result.userId,
            email: email,
            role: result.role,
          },
        })
      );

      const target = getCustomerRedirectTarget(redirect, table);
      navigate(target, { replace: true });
    } catch (err: unknown) {
      setError(normalizeApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpIdentifier) {
      setError(
        `Please enter your ${otpType === "email" ? "email address" : "phone number"}.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload =
        otpType === "email"
          ? { email: otpIdentifier }
          : { phoneNumber: otpIdentifier };

      const response = await sendOtpCode(payload);
      setOtpSent(true);
      setSuccessMessage(response.message);
    } catch (err: unknown) {
      setError(normalizeApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpIdentifier || !otpCode) {
      setError("Verification code is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload =
        otpType === "email"
          ? { email: otpIdentifier, otp: otpCode }
          : { phoneNumber: otpIdentifier, otp: otpCode };

      const result = await verifyOtpCode(payload);
      dispatch(
        sessionEstablished({
          accessToken: result.accessToken,
          user: {
            id: result.userId,
            email:
              otpType === "email"
                ? otpIdentifier
                : `${otpIdentifier}@customer.sms`,
            role: result.role,
          },
        })
      );

      const target = getCustomerRedirectTarget(redirect, table);
      navigate(target, { replace: true });
    } catch (err: unknown) {
      setError(normalizeApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Avatar sx={{ bgcolor: "primary.main", mx: "auto" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Stack spacing={1} sx={{ textAlign: "center" }}>
        <Typography component="h1" variant="h4">
          Customer Portal
        </Typography>
        <Typography color="text.secondary">
          Welcome! Please sign in to place your order.
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

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Email & Password" />
          <Tab label="One-Time PIN (OTP)" />
        </Tabs>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ whiteSpace: "pre-line" }}>
          {successMessage}
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {activeTab === 0 ? (
        // Email/Password Form
        <Stack
          component="form"
          noValidate
          onSubmit={handleEmailLogin}
          spacing={2}
        >
          <TextField
            autoComplete="email"
            disabled={loading}
            fullWidth
            label="Email address"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            disabled={loading}
            fullWidth
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            value={password}
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
          <Button
            disabled={loading}
            fullWidth
            size="large"
            startIcon={
              loading ? <CircularProgress color="inherit" size={18} /> : null
            }
            type="submit"
            variant="contained"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Stack>
      ) : (
        // OTP Form
        <Stack
          component="form"
          noValidate
          onSubmit={handleVerifyOtp}
          spacing={2}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              fullWidth
              onClick={() => {
                setOtpType("email");
                setOtpIdentifier("");
                setOtpSent(false);
                setOtpCode("");
              }}
              variant={otpType === "email" ? "contained" : "outlined"}
            >
              Email OTP
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setOtpType("phone");
                setOtpIdentifier("");
                setOtpSent(false);
                setOtpCode("");
              }}
              variant={otpType === "phone" ? "contained" : "outlined"}
            >
              Phone OTP
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              disabled={loading || otpSent}
              fullWidth
              label={otpType === "email" ? "Email address" : "Phone number"}
              onChange={(e) => setOtpIdentifier(e.target.value)}
              type={otpType === "email" ? "email" : "tel"}
              value={otpIdentifier}
            />
            {!otpSent && (
              <Button
                disabled={loading || !otpIdentifier}
                onClick={handleSendOtp}
                startIcon={
                  loading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : (
                    <TextsmsOutlinedIcon />
                  )
                }
                variant="outlined"
              >
                Send
              </Button>
            )}
          </Stack>

          {otpSent && (
            <>
              <TextField
                autoFocus
                disabled={loading}
                fullWidth
                label="Enter 6-Digit PIN"
                onChange={(e) => setOtpCode(e.target.value)}
                type="text"
                value={otpCode}
                slotProps={{ htmlInput: { maxLength: 6 } }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  disabled={loading}
                  fullWidth
                  onClick={() => setOtpSent(false)}
                  variant="outlined"
                >
                  Resend Code
                </Button>
                <Button
                  disabled={loading || otpCode.length < 6}
                  fullWidth
                  type="submit"
                  variant="contained"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      )}

      <Typography align="center" variant="body2">
        Don't have an account?{" "}
        <Link
          component={RouterLink}
          to={`${ROUTES.customerSignup}?redirect=${encodeURIComponent(
            redirect ?? ROUTES.customerMenu
          )}${table ? `&table=${table}` : ""}`}
        >
          Create one
        </Link>
      </Typography>
    </Stack>
  );
};
