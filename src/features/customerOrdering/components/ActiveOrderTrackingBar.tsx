import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import { Box, ButtonBase, Chip, Paper, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { customerOrderTrackingPath } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { selectCustomerActiveOrders } from "../store/customerOrderingSlice";
import { refreshCustomerOrder } from "../store/customerOrderingThunks";
import {
  getCustomerOrderStatusLabel,
  getEstimatedTimeLabel,
} from "../utils/activeOrder";
import type { CustomerOrder } from "../types/customerOrdering.types";

interface SingleOrderTrackingBarProps {
  order: CustomerOrder;
}

const SingleOrderTrackingBar = ({ order }: SingleOrderTrackingBarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const input = {
      orderId: order.orderId,
      tableNumber: order.tableNumber,
    };

    void dispatch(refreshCustomerOrder(input));
    const intervalId = window.setInterval(() => {
      void dispatch(refreshCustomerOrder(input));
    }, 10_000);

    return () => window.clearInterval(intervalId);
  }, [order.orderId, order.tableNumber, dispatch]);

  const estimatedTime = getEstimatedTimeLabel(order);

  return (
    <Paper
      component={ButtonBase}
      elevation={8}
      onClick={() => navigate(customerOrderTrackingPath(order.orderId))}
      sx={{
        alignItems: "center",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        gap: 1.5,
        maxWidth: 720,
        mx: "auto",
        p: { xs: 1.5, sm: 2 },
        pointerEvents: "auto",
        textAlign: "left",
        width: "100%",
      }}
    >
      <FastfoodOutlinedIcon color="primary" sx={{ flexShrink: 0 }} />
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700 }}>
          Order #{order.orderId}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}
        >
          <Typography color="text.secondary" variant="body2">
            {getCustomerOrderStatusLabel(order.status)}
          </Typography>
          {estimatedTime && (
            <Chip
              icon={<AccessTimeOutlinedIcon />}
              label={estimatedTime}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center", color: "primary.main", flexShrink: 0 }}
      >
        <Typography
          sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700 }}
          variant="body2"
        >
          Track Order
        </Typography>
        <ArrowForwardOutlinedIcon fontSize="small" />
      </Stack>
    </Paper>
  );
};

export const ActiveOrderTrackingBar = () => {
  const activeOrders = useAppSelector(selectCustomerActiveOrders);

  if (activeOrders.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        bottom: { xs: 12, sm: 16 },
        left: 0,
        pointerEvents: "none",
        position: "fixed",
        px: { xs: 1.5, sm: 2 },
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <Stack spacing={1.5} sx={{ maxWidth: 720, mx: "auto" }}>
        {activeOrders.map((order) => (
          <SingleOrderTrackingBar key={order.orderId} order={order} />
        ))}
      </Stack>
    </Box>
  );
};
