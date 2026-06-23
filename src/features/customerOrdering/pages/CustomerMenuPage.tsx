import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { CustomerMenuItemCard } from "../components/CustomerMenuItemCard";
import {
  cartItemAdded,
  customerTableNumberSet,
  selectCustomerCart,
  selectCustomerMenu,
} from "../store/customerOrderingSlice";
import { loadCustomerMenu } from "../store/customerOrderingThunks";

export const CustomerMenuPage = () => {
  const dispatch = useAppDispatch();
  const menu = useAppSelector(selectCustomerMenu);
  const cart = useAppSelector(selectCustomerCart);
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");

  useEffect(() => {
    if (tableParam) {
      const tableNum = Number(tableParam);
      if (!isNaN(tableNum) && tableNum > 0) {
        dispatch(customerTableNumberSet(tableNum));
      }
    }
  }, [tableParam, dispatch]);

  useEffect(() => {
    dispatch(loadCustomerMenu());
  }, [dispatch]);

  const visibleItems = useMemo(() => {
    if (!menu.data) {
      return [];
    }

    return categoryId === "all"
      ? menu.data.menuItems
      : menu.data.menuItems.filter((item) => item.categoryId === categoryId);
  }, [categoryId, menu.data]);

  const getCartQuantity = (itemId: number) => {
    const cartItem = cart.find((item) => item.id === itemId);
    return cartItem?.quantity ?? 0;
  };

  // Loading state
  if (
    (menu.status === "idle" || menu.status === "pending") &&
    !menu.data
  ) {
    return (
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h3">
            What would you like?
          </Typography>
          <Typography color="text.secondary">
            Loading the menu...
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ gap: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={80}
              height={32}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Stack>
        <Stack
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {[1, 2, 3].map((i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{ border: 1, borderColor: "divider" }}
            >
              <Skeleton variant="rectangular" height={180} />
              <Stack spacing={1} sx={{ p: 2 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="rounded" height={36} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    );
  }

  // Error state
  if (menu.error) {
    return (
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h3">
            What would you like?
          </Typography>
        </Stack>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => dispatch(loadCustomerMenu())}
              size="small"
            >
              Retry
            </Button>
          }
        >
          {menu.error.message}
        </Alert>
        {import.meta.env.DEV && menu.error.code && (
          <Alert severity="info">
            Debug: {menu.error.code}
            {menu.error.status ? ` (HTTP ${menu.error.status})` : ""}
          </Alert>
        )}
      </Stack>
    );
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ gap: 2, justifyContent: "space-between" }}
      >
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h3">
            What would you like?
          </Typography>
          <Typography color="text.secondary">
            Choose your items now. You will enter your table number at checkout.
          </Typography>
        </Stack>
        <Button
          component={RouterLink}
          to={ROUTES.customerCart}
          variant="outlined"
        >
          Review cart{cartItemCount > 0 ? ` (${cartItemCount})` : ""}
        </Button>
      </Stack>

      {/* Category filter chips */}
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
        <Chip
          color={categoryId === "all" ? "primary" : "default"}
          label="All"
          onClick={() => setCategoryId("all")}
          variant={categoryId === "all" ? "filled" : "outlined"}
        />
        {menu.data?.categories.map((category) => (
          <Chip
            color={categoryId === category.id ? "primary" : "default"}
            key={category.id}
            label={category.name}
            onClick={() => setCategoryId(category.id)}
            variant={categoryId === category.id ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {/* Refreshing indicator */}
      {menu.status === "pending" && menu.data && (
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" variant="body2">
            Refreshing menu...
          </Typography>
        </Stack>
      )}

      {/* Menu items grid */}
      {visibleItems.length === 0 ? (
        <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 5 }}>
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            No available items are listed in this category.
          </Typography>
        </Paper>
      ) : (
        <Stack
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {visibleItems.map((item) => (
            <CustomerMenuItemCard
              cartQuantity={getCartQuantity(item.id)}
              item={item}
              key={item.id}
              onAdd={(menuItem) => dispatch(cartItemAdded(menuItem))}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};
