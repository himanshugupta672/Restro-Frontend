import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { customerOrderTrackingPath, ROUTES } from "@/constants/routes";
import {
  selectCustomerActiveOrders,
  selectCustomerTableNumber,
} from "@/features/customerOrdering/store/customerOrderingSlice";
import { useAppSelector } from "@/hooks/reduxHooks";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const OrderConfirmationPage = () => {
  const activeOrders = useAppSelector(selectCustomerActiveOrders);
  const tableNumber = useAppSelector(selectCustomerTableNumber);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const parsedOrderId = Number(orderId);

  const order = activeOrders.find((o) => o.orderId === parsedOrderId) ?? null;

  useEffect(() => {
    if (order) {
      toast.success(`Order #${order.orderId} placed successfully!`);

      // Auto-redirect to menu page after 3 seconds
      const timeoutId = setTimeout(() => {
        navigate(ROUTES.customerMenu, { replace: true });
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <Alert
        action={
          Number.isInteger(parsedOrderId) && parsedOrderId > 0 ? (
            <Button
              color="inherit"
              component={RouterLink}
              to={customerOrderTrackingPath(parsedOrderId)}
            >
              Track order
            </Button>
          ) : undefined
        }
        severity="info"
      >
        The order confirmation is no longer available in this tab.
      </Alert>
    );
  }

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 4 }}>
      <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
        <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 64 }} />
        <Stack spacing={1}>
          <Typography component="h1" variant="h4">
            Order sent to the kitchen
          </Typography>
          <Typography color="text.secondary">
            Order #{order.orderId} for Table {order.tableNumber}
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            Redirecting you back to the menu in a few seconds...
          </Typography>
        </Stack>
        <Typography sx={{ fontWeight: 700 }} variant="h5">
          {currencyFormatter.format(order.totalAmount)}
        </Typography>
        <Button
          component={RouterLink}
          to={customerOrderTrackingPath(order.orderId)}
          variant="contained"
          state={{ tableNumber }}
        >
          Track your order
        </Button>
        <Button component={RouterLink} to={ROUTES.customerMenu}>
          Return to menu now
        </Button>
      </Stack>
    </Paper>
  );
};
