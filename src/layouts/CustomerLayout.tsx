import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Outlet } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { ActiveOrderTrackingBar } from "@/features/customerOrdering/components/ActiveOrderTrackingBar";
import {
  selectCustomerActiveOrders,
  selectCustomerOrdering,
} from "@/features/customerOrdering/store/customerOrderingSlice";
import { getCartItemCount } from "@/features/customerOrdering/utils/customerSession";
import { useAppSelector } from "@/hooks/reduxHooks";
import { selectCurrentUser } from "@/features/auth";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import IconButton from "@mui/material/IconButton";

export const CustomerLayout = () => {
  const ordering = useAppSelector(selectCustomerOrdering);
  const activeOrders = useAppSelector(selectCustomerActiveOrders);
  const currentUser = useAppSelector(selectCurrentUser);
  const itemCount = getCartItemCount(ordering);
  const hasActiveOrder = activeOrders.length > 0;
  const isCustomer = currentUser?.role === "Customer";

  // Dynamic padding-bottom based on the number of tracking bars
  const pbXs = hasActiveOrder ? 12 + activeOrders.length * 76 : 3;
  const pbMd = hasActiveOrder ? 16 + activeOrders.length * 84 : 5;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar color="inherit" elevation={0} position="sticky">
        <Toolbar sx={{ borderBottom: 1, borderColor: "divider", gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            startIcon={<RestaurantMenuIcon color="primary" />}
            sx={{ fontSize: "1rem", fontWeight: 700 }}
            to={ROUTES.customerMenu}
          >
            Restaurant
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {ordering.tableNumber && (
            <Typography color="text.secondary" variant="body2">
              Table {ordering.tableNumber}
            </Typography>
          )}
          <Button
            color="inherit"
            component={RouterLink}
            startIcon={
              <Badge badgeContent={itemCount} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            }
            to={ROUTES.customerCart}
          >
            Cart
          </Button>
          {isCustomer && (
            <IconButton
              component={RouterLink}
              to="/customer/dashboard"
              color="inherit"
              aria-label="Customer dashboard"
            >
              <AccountCircleOutlinedIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          pb: { xs: `${pbXs}px`, md: `${pbMd}px` },
          pt: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={3}>
          <Outlet />
        </Stack>
      </Container>
      <ActiveOrderTrackingBar />
    </Box>
  );
};
