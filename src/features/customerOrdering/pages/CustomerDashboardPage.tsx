import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { ROUTES } from "@/constants/routes";
import { selectCurrentUser, logoutUser } from "@/features/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { getCustomerOrderHistory } from "../api/customerOrderingApi";
import {
  cartItemsReordered,
  selectCustomerMenu,
} from "../store/customerOrderingSlice";
import { loadCustomerMenu } from "../store/customerOrderingThunks";
import type { CustomerOrder } from "../types/customerOrdering.types";
import { getCustomerOrderStatusLabel } from "../utils/activeOrder";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  style: "currency",
});

export const CustomerDashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const menu = useAppSelector(selectCustomerMenu);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load menu to support reordering lookup
    if (!menu.data) {
      void dispatch(loadCustomerMenu());
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const history = await getCustomerOrderHistory();
        setOrders(history);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };

    void fetchHistory();
  }, [dispatch, menu.data]);

  const handleReorder = (order: CustomerOrder) => {
    if (!menu.data) {
      toast.error("Menu is not loaded yet. Please try again.");
      return;
    }

    const itemsToReorder = order.items
      .map((orderItem) => {
        const menuItem = menu.data?.menuItems.find(
          (m) => m.id === orderItem.menuItemId
        );
        if (!menuItem) return null;
        return {
          ...menuItem,
          quantity: orderItem.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (itemsToReorder.length === 0) {
      toast.error("None of the items in this order are currently available.");
      return;
    }

    dispatch(cartItemsReordered(itemsToReorder));
    toast.success("Items added to cart! Proceed to checkout.");
    navigate(ROUTES.customerCart);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.customerLogin);
  };

  if (loading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 6 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading your portal...</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Welcome & Profile Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          borderRadius: 2,
          color: "primary.contrastText",
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Welcome back!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {currentUser?.email}
            </Typography>
          </Stack>
          <Button
            color="inherit"
            onClick={handleLogout}
            variant="outlined"
            sx={{
              borderColor: "rgba(255, 255, 255, 0.5)",
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            Sign Out
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Order History */}
      <Stack spacing={2.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Your Order History
        </Typography>

        {orders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ border: 1, borderColor: "divider", p: 6, textAlign: "center" }}
          >
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              You haven't placed any orders yet.
            </Typography>
            <Button
              component={RouterLink}
              to={ROUTES.customerMenu}
              variant="contained"
            >
              Order Food Now
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString(
                undefined,
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <Card
                  key={order.orderId}
                  elevation={0}
                  sx={{ border: 1, borderColor: "divider" }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Order Metadata */}
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Order #{order.orderId}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Placed on {formattedDate}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                          <Typography
                            color="primary"
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                          >
                            {currencyFormatter.format(order.totalAmount)}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Status: {getCustomerOrderStatusLabel(order.status)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider />

                      {/* Items Ordered */}
                      <Stack spacing={1}>
                        {order.items.map((item, index) => (
                          <Stack
                            key={index}
                            direction="row"
                            sx={{ justifyContent: "space-between" }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {item.quantity} x {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {currencyFormatter.format(item.lineTotal)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>

                      {order.specialInstructions && (
                        <Box
                          sx={{
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            p: 1.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", fontWeight: 700 }}
                          >
                            Special Instructions:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.specialInstructions}
                          </Typography>
                        </Box>
                      )}

                      <Divider />

                      {/* Actions */}
                      <Stack direction="row" spacing={2}>
                        <Button
                          onClick={() => handleReorder(order)}
                          variant="contained"
                          size="small"
                        >
                          Reorder Items
                        </Button>
                        <Button
                          component={RouterLink}
                          to={`/customer/orders/${order.orderId}`}
                          variant="outlined"
                          size="small"
                        >
                          Track Status
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
