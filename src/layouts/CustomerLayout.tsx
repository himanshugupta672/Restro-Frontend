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
import { selectCustomerOrdering } from "@/features/customerOrdering/store/customerOrderingSlice";
import { getCartItemCount } from "@/features/customerOrdering/utils/customerSession";
import { useAppSelector } from "@/hooks/reduxHooks";

export const CustomerLayout = () => {
  const ordering = useAppSelector(selectCustomerOrdering);
  const itemCount = getCartItemCount(ordering);

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
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Outlet />
        </Stack>
      </Container>
    </Box>
  );
};
