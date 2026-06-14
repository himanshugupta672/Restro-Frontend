import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import { Alert, Stack, Typography } from "@mui/material";

import type { OrderStatus } from "@/types/order";

interface OrderTrackingTimelineProps {
  status: OrderStatus;
}

const steps = [
  { label: "Order received", statuses: ["Pending", "Assigned"] },
  { label: "Accepted by kitchen", statuses: ["Accepted"] },
  { label: "Being prepared", statuses: ["Preparing"] },
  { label: "Ready to serve", statuses: ["Ready"] },
  { label: "Served", statuses: ["Completed"] },
] as const;

const statusOrder: Record<OrderStatus, number> = {
  Accepted: 1,
  Assigned: 0,
  Cancelled: -1,
  Completed: 4,
  Pending: 0,
  Preparing: 2,
  Ready: 3,
};

export const OrderTrackingTimeline = ({
  status,
}: OrderTrackingTimelineProps) => {
  if (status === "Cancelled") {
    return (
      <Alert severity="error">
        This order was cancelled. Please speak with restaurant staff.
      </Alert>
    );
  }

  const activeIndex = statusOrder[status];

  return (
    <Stack spacing={2}>
      {steps.map((step, index) => {
        const completed = index <= activeIndex;
        return (
          <Stack
            direction="row"
            key={step.label}
            sx={{ alignItems: "center", gap: 1.5 }}
          >
            {completed ? (
              <CheckCircleOutlinedIcon color="success" />
            ) : (
              <RadioButtonUncheckedOutlinedIcon color="disabled" />
            )}
            <Typography
              color={completed ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: index === activeIndex ? 700 : 400 }}
            >
              {step.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};
