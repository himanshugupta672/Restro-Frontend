import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { CustomerMenuItemCard } from "../components/CustomerMenuItemCard";
import {
  cartItemAdded,
  selectCustomerMenu,
} from "../store/customerOrderingSlice";
import { loadCustomerMenu } from "../store/customerOrderingThunks";

export const CustomerMenuPage = () => {
  const dispatch = useAppDispatch();
  const menu = useAppSelector(selectCustomerMenu);
  const [categoryId, setCategoryId] = useState<number | "all">("all");

  useEffect(() => {
    const request = dispatch(loadCustomerMenu());
    return () => request.abort();
  }, [dispatch]);

  const visibleItems = useMemo(() => {
    if (!menu.data) {
      return [];
    }

    return categoryId === "all"
      ? menu.data.menuItems
      : menu.data.menuItems.filter((item) => item.categoryId === categoryId);
  }, [categoryId, menu.data]);

  if (menu.status === "pending" && !menu.data) {
    return (
      <Paper
        elevation={0}
        sx={{
          alignItems: "center",
          border: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "center",
          minHeight: 360,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <CircularProgress />
          <Typography color="text.secondary">Opening your menu...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (menu.error) {
    return (
      <Alert
        action={
          <Button color="inherit" onClick={() => dispatch(loadCustomerMenu())}>
            Retry
          </Button>
        }
        severity="error"
      >
        {menu.error.message}
      </Alert>
    );
  }

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
        <Button component={RouterLink} to={ROUTES.customerCart} variant="outlined">
          Review cart
        </Button>
      </Stack>

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
