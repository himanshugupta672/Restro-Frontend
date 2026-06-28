import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import { ActiveOrderTrackingBar } from "@/features/customerOrdering/components/ActiveOrderTrackingBar";
import { selectCustomerActiveOrders } from "@/features/customerOrdering/store/customerOrderingSlice";
import { useAppSelector } from "@/hooks/reduxHooks";

export const CustomerAuthLayout = () => {
  const activeOrders = useAppSelector(selectCustomerActiveOrders);
  const hasActiveOrder = activeOrders.length > 0;

  // Add padding-bottom if active tracking bars are visible
  const pbXs = hasActiveOrder ? 12 + activeOrders.length * 76 : 4;
  const pbMd = hasActiveOrder ? 16 + activeOrders.length * 84 : 4;

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        minHeight: "100vh",
        pb: { xs: `${pbXs}px`, md: `${pbMd}px` },
        pt: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ alignItems: "center" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <RestaurantMenuIcon color="primary" />
            <Typography sx={{ fontWeight: 700 }} variant="h6">
              Restaurant RMS
            </Typography>
          </Stack>
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              p: { xs: 3, sm: 5 },
              width: "100%",
            }}
          >
            <Outlet />
          </Paper>
        </Stack>
      </Container>
      <ActiveOrderTrackingBar />
    </Box>
  );
};
