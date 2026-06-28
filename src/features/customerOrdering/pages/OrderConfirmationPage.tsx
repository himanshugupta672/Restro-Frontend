import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";

import { customerOrderTrackingPath, ROUTES } from "@/constants/routes";
import {
  selectCustomerOrder,
  selectCustomerTableNumber,
} from "@/features/customerOrdering/store/customerOrderingSlice";
import { useAppSelector } from "@/hooks/reduxHooks";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const OrderConfirmationPage = () => {
  const order = useAppSelector(selectCustomerOrder);
  const tableNumber = useAppSelector(selectCustomerTableNumber);
  const { orderId } = useParams();
  const parsedOrderId = Number(orderId);

  if (!order || order.orderId !== parsedOrderId) {
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
          Return to menu
        </Button>
      </Stack>
    </Paper>
  );
};
