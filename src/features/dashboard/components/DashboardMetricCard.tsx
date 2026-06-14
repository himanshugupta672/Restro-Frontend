import { Box, Paper, Stack, Typography } from "@mui/material";

import type { DashboardMetric } from "../types/dashboard.types";

interface DashboardMetricCardProps {
  metric: DashboardMetric;
}

const toneColors = {
  primary: "primary.main",
  secondary: "secondary.main",
  success: "success.main",
  warning: "warning.main",
} as const;

export const DashboardMetricCard = ({ metric }: DashboardMetricCardProps) => (
  <Paper
    component="article"
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      height: "100%",
      overflow: "hidden",
      p: 3,
      position: "relative",
    }}
  >
    <Box
      sx={{
        bgcolor: toneColors[metric.tone],
        bottom: 0,
        left: 0,
        position: "absolute",
        top: 0,
        width: 4,
      }}
    />
    <Stack spacing={0.75}>
      <Typography color="text.secondary" variant="body2">
        {metric.label}
      </Typography>
      <Typography component="p" sx={{ fontWeight: 700 }} variant="h4">
        {metric.value}
      </Typography>
      <Typography color="text.secondary" variant="caption">
        {metric.helperText}
      </Typography>
    </Stack>
  </Paper>
);
