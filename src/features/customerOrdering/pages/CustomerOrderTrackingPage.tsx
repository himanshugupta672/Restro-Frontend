import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { OrderTrackingTimeline } from "../components/OrderTrackingTimeline";
import { selectCustomerOrdering } from "../store/customerOrderingSlice";
import { refreshCustomerOrder } from "../store/customerOrderingThunks";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const CustomerOrderTrackingPage = () => {
  const dispatch = useAppDispatch();
  const ordering = useAppSelector(selectCustomerOrdering);
  const { orderId } = useParams();
  const parsedOrderId = Number(orderId);
  const order = ordering.activeOrders.find((o) => o.orderId === parsedOrderId) ?? null;
  const tableNumber =
    ordering.tableNumber ?? order?.tableNumber ?? null;
  const canTrack =
    Number.isInteger(parsedOrderId) &&
    parsedOrderId > 0 &&
    Boolean(tableNumber);

  useEffect(() => {
    if (!canTrack || !tableNumber) {
      return;
    }

    const input = {
      orderId: parsedOrderId,
      tableNumber,
    };
    void dispatch(refreshCustomerOrder(input));
    const intervalId = window.setInterval(() => {
      void dispatch(refreshCustomerOrder(input));
    }, 10_000);

    return () => window.clearInterval(intervalId);
  }, [canTrack, dispatch, parsedOrderId, tableNumber]);

  if (!canTrack || !tableNumber) {
    return (
      <Alert severity="warning">
        Table number is required to track this order. Please browse the menu or checkout.
      </Alert>
    );
  }

  const isLoading = ordering.trackingStatus === "pending";
  const refresh = () =>
    dispatch(
      refreshCustomerOrder({
        orderId: parsedOrderId,
        tableNumber,
      })
    );

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ gap: 2, justifyContent: "space-between" }}
      >
        <Stack spacing={0.5}>
          <Button
            component={RouterLink}
            to={ROUTES.customerMenu}
            replace
            sx={{ alignSelf: "flex-start", mb: 1, p: 0, textTransform: "none", minWidth: 0 }}
            size="small"
          >
            &larr; Back to Menu
          </Button>
          <Typography component="h1" variant="h4">
            Track order #{parsedOrderId}
          </Typography>
          <Typography color="text.secondary">
            Status refreshes automatically every 10 seconds.
          </Typography>
        </Stack>
        <Button
          disabled={isLoading}
          onClick={refresh}
          startIcon={
            isLoading ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <RefreshOutlinedIcon />
            )
          }
          variant="outlined"
        >
          Refresh
        </Button>
      </Stack>

      {ordering.trackingError && (
        <Alert severity="error">{ordering.trackingError.message}</Alert>
      )}

      {!order && isLoading ? (
        <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 6 }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary">
              Checking your order...
            </Typography>
          </Stack>
        </Paper>
      ) : order ? (
        <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 4 }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{ gap: 2, justifyContent: "space-between" }}
            >
              <Typography>
                Table {order.tableNumber} - {order.items.length} menu items
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {currencyFormatter.format(order.totalAmount)}
              </Typography>
            </Stack>
            <Divider />
            <OrderTrackingTimeline status={order.status} />
            <Divider />
            <Button component={RouterLink} to={ROUTES.customerMenu} replace>
              View menu
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
};
