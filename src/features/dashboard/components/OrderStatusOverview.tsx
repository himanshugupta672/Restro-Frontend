import { LinearProgress, Paper, Stack, Typography } from "@mui/material";

import type { OrderStatusCount } from "../types/dashboard.types";

interface OrderStatusOverviewProps {
  statusCounts: OrderStatusCount[];
}

export const OrderStatusOverview = ({
  statusCounts,
}: OrderStatusOverviewProps) => {
  const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{ border: 1, borderColor: "divider", p: 3 }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography component="h2" variant="h6">
            Order status
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Current distribution across the loaded workflow.
          </Typography>
        </Stack>

        {statusCounts.length === 0 ? (
          <Typography color="text.secondary">
            No order activity is available yet.
          </Typography>
        ) : (
          statusCounts.map((item) => (
            <Stack key={item.status} spacing={0.75}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2">{item.status}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {item.count}
                </Typography>
              </Stack>
              <LinearProgress
                aria-label={`${item.status}: ${item.count} orders`}
                value={total === 0 ? 0 : (item.count / total) * 100}
                variant="determinate"
              />
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
};
