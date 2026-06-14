import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { selectCurrentUser, USER_ROLES } from "@/features/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import type { OrderStatus } from "@/types/order";

import { ChefOrderActionDialog } from "../components/ChefOrderActionDialog";
import { OrderDetailsDialog } from "../components/OrderDetailsDialog";
import { OrderFilters } from "../components/OrderFilters";
import { OrdersTable } from "../components/OrdersTable";
import { UpdateOrderStatusDialog } from "../components/UpdateOrderStatusDialog";
import {
  orderMutationCleared,
  selectOrderMutationError,
  selectOrderMutationStatus,
  selectOrdersData,
} from "../store/ordersSlice";
import {
  acceptChefOrder,
  changeOrderStatus,
  loadOrders,
  rejectChefOrder,
} from "../store/ordersThunks";
import type { Order, OrderStatusFilter } from "../types/order.types";
import { filterOrders, getPrimaryOrderAction } from "../utils/orderWorkflow";

export const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const ordersData = useAppSelector(selectOrdersData);
  const mutationError = useAppSelector(selectOrderMutationError);
  const mutationStatus = useAppSelector(selectOrderMutationStatus);
  const isLoading = ordersData.status === "pending";
  const isMutating = mutationStatus === "pending";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [chefAction, setChefAction] = useState<"accept" | "reject" | null>(
    null
  );
  const [chefActionOrder, setChefActionOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user || user.role === USER_ROLES.customer) {
      return;
    }

    const request = dispatch(loadOrders({ role: user.role }));
    return () => request.abort();
  }, [dispatch, user]);

  const filteredOrders = useMemo(
    () =>
      filterOrders(ordersData.data.orders, {
        search,
        status: statusFilter,
      }),
    [ordersData.data.orders, search, statusFilter]
  );

  if (!user || user.role === USER_ROLES.customer) {
    return null;
  }

  const clearMutation = () => {
    dispatch(orderMutationCleared());
  };

  const handleRefresh = () => {
    void dispatch(loadOrders({ role: user.role }));
  };

  const handleStatusSubmit = async (status: OrderStatus) => {
    if (!statusOrder) {
      return false;
    }

    const result = await dispatch(
      changeOrderStatus({
        orderId: statusOrder.id,
        role: user.role,
        status,
      })
    );

    return changeOrderStatus.fulfilled.match(result);
  };

  const handleChefDecision = async () => {
    if (!chefActionOrder || !chefAction) {
      return;
    }

    const input = {
      orderId: chefActionOrder.id,
      role: user.role,
    };
    const result =
      chefAction === "accept"
        ? await dispatch(acceptChefOrder(input))
        : await dispatch(rejectChefOrder(input));
    const succeeded =
      acceptChefOrder.fulfilled.match(result) ||
      rejectChefOrder.fulfilled.match(result);

    if (succeeded) {
      setChefAction(null);
      setChefActionOrder(null);
    }
  };

  const handleAdvanceOrder = async (order: Order) => {
    const action = getPrimaryOrderAction(order, user.role);
    if (!action) {
      return;
    }

    await dispatch(
      changeOrderStatus({
        orderId: order.id,
        role: user.role,
        status: action.status,
      })
    );
  };

  const openChefAction = (order: Order, action: "accept" | "reject") => {
    clearMutation();
    setChefActionOrder(order);
    setChefAction(action);
  };

  const activeOrders = ordersData.data.orders.filter(
    (order) => order.status !== "Completed" && order.status !== "Cancelled"
  ).length;
  const readyOrders = ordersData.data.orders.filter(
    (order) => order.status === "Ready"
  ).length;
  const pendingOrders = ordersData.data.orders.filter(
    (order) => order.status === "Pending" || order.status === "Assigned"
  ).length;
  const isInitialLoading =
    ordersData.status === "idle" ||
    (isLoading && ordersData.data.orders.length === 0);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h4">
            Order management
          </Typography>
          <Typography color="text.secondary">
            {user.role === USER_ROLES.chef
              ? "Manage your kitchen queue and move orders through preparation."
              : "Monitor restaurant orders and control their operational status."}
          </Typography>
        </Stack>
        <Button
          disabled={isLoading}
          onClick={handleRefresh}
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

      {ordersData.error && (
        <Alert
          action={
            <Button color="inherit" onClick={handleRefresh} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          {ordersData.error.message}
        </Alert>
      )}

      {mutationError && !chefAction && !statusOrder && (
        <Alert severity="error">{mutationError.message}</Alert>
      )}

      {isInitialLoading ? (
        <Paper
          elevation={0}
          sx={{
            alignItems: "center",
            border: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            minHeight: 320,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading orders...</Typography>
          </Stack>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            <OrderSummaryCard label="Active orders" value={activeOrders} />
            <OrderSummaryCard label="Awaiting action" value={pendingOrders} />
            <OrderSummaryCard label="Ready to serve" value={readyOrders} />
          </Box>

          <OrderFilters
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
            search={search}
            status={statusFilter}
          />

          <Stack spacing={0.5}>
            <Typography component="h2" variant="h6">
              Orders
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Showing {filteredOrders.length} of {ordersData.data.orders.length}{" "}
              orders.
            </Typography>
          </Stack>

          <OrdersTable
            isMutating={isMutating}
            onAccept={(order) => openChefAction(order, "accept")}
            onAdvance={handleAdvanceOrder}
            onChangeStatus={(order) => {
              clearMutation();
              setStatusOrder(order);
            }}
            onReject={(order) => openChefAction(order, "reject")}
            onView={setDetailsOrder}
            orders={filteredOrders}
            role={user.role}
          />
        </>
      )}

      <OrderDetailsDialog
        onClose={() => setDetailsOrder(null)}
        open={Boolean(detailsOrder)}
        order={detailsOrder}
      />

      <UpdateOrderStatusDialog
        error={mutationError}
        isSubmitting={isMutating}
        key={statusOrder?.id ?? "no-order"}
        onClose={() => {
          if (!isMutating) {
            setStatusOrder(null);
            clearMutation();
          }
        }}
        onSubmit={handleStatusSubmit}
        open={Boolean(statusOrder)}
        order={statusOrder}
      />

      <ChefOrderActionDialog
        action={chefAction}
        error={mutationError}
        isSubmitting={isMutating}
        onClose={() => {
          if (!isMutating) {
            setChefAction(null);
            setChefActionOrder(null);
            clearMutation();
          }
        }}
        onConfirm={handleChefDecision}
        order={chefActionOrder}
      />
    </Stack>
  );
};

interface OrderSummaryCardProps {
  label: string;
  value: number;
}

const OrderSummaryCard = ({ label, value }: OrderSummaryCardProps) => (
  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2.5 }}>
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700 }} variant="h4">
      {value}
    </Typography>
  </Paper>
);
