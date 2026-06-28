import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import {
  Link as RouterLink,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import {
  cartItemAdded,
  customerTableNumberSet,
  selectCustomerCart,
  selectCustomerMenu,
} from "../store/customerOrderingSlice";
import { loadCustomerMenu } from "../store/customerOrderingThunks";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const CustomerMenuItemDetailsPage = () => {
  const dispatch = useAppDispatch();
  const menu = useAppSelector(selectCustomerMenu);
  const cart = useAppSelector(selectCustomerCart);
  const { itemId } = useParams();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const parsedItemId = Number(itemId);

  useEffect(() => {
    if (tableParam) {
      const tableNumber = Number(tableParam);
      if (Number.isInteger(tableNumber) && tableNumber > 0) {
        dispatch(customerTableNumberSet(tableNumber));
      }
    }
  }, [dispatch, tableParam]);

  useEffect(() => {
    dispatch(loadCustomerMenu());
  }, [dispatch]);

  if ((menu.status === "idle" || menu.status === "pending") && !menu.data) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 6 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading item details...</Typography>
      </Stack>
    );
  }

  if (menu.error) {
    return <Alert severity="error">{menu.error.message}</Alert>;
  }

  const item = menu.data?.menuItems.find(
    (menuItem) => menuItem.id === parsedItemId
  );
  const cartQuantity =
    cart.find((cartItem) => cartItem.id === parsedItemId)?.quantity ?? 0;

  if (!item) {
    return (
      <Alert
        action={
          <Button
            color="inherit"
            component={RouterLink}
            to={ROUTES.customerMenu}
          >
            Menu
          </Button>
        }
        severity="warning"
      >
        This menu item is not available right now.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        startIcon={<ArrowBackOutlinedIcon />}
        sx={{ alignSelf: "flex-start" }}
        to={`${ROUTES.customerMenu}${tableParam ? `?table=${tableParam}` : ""}`}
      >
        Back to menu
      </Button>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 0 }}>
        {item.imageUrl ? (
          <Box
            alt={item.name}
            component="img"
            src={item.imageUrl}
            sx={{
              aspectRatio: { xs: "4 / 3", md: "16 / 7" },
              display: "block",
              objectFit: "cover",
              width: "100%",
            }}
          />
        ) : (
          <Box
            sx={{
              alignItems: "center",
              aspectRatio: { xs: "4 / 3", md: "16 / 7" },
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontWeight: 700 }} variant="h2">
              {item.name.charAt(0).toUpperCase()}
            </Typography>
          </Box>
        )}

        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ gap: 2, justifyContent: "space-between" }}
          >
            <Stack spacing={0.5}>
              <Typography component="h1" variant="h4">
                {item.name}
              </Typography>
              {item.prepTimeMinutes > 0 && (
                <Typography color="text.secondary">
                  About {item.prepTimeMinutes} minutes
                </Typography>
              )}
            </Stack>
            <Typography color="primary" sx={{ fontWeight: 700 }} variant="h5">
              {currencyFormatter.format(item.price)}
            </Typography>
          </Stack>

          {item.description && (
            <Typography color="text.secondary">{item.description}</Typography>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              fullWidth
              onClick={() => dispatch(cartItemAdded(item))}
              startIcon={<AddOutlinedIcon />}
              variant="contained"
            >
              {cartQuantity > 0
                ? `Add another (${cartQuantity} in cart)`
                : "Add to cart"}
            </Button>
            <Button component={RouterLink} fullWidth to={ROUTES.customerCart}>
              Review cart
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};
