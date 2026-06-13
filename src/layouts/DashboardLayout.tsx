import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  logoutUser,
  selectCurrentUser,
  selectLogoutStatus,
  type UserRole,
} from "@/features/auth";
import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { navigationItems } from "@/routes/navigation";

const canAccess = (allowedRoles: readonly UserRole[], role: UserRole) =>
  allowedRoles.includes(role);

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const logoutStatus = useAppSelector(selectLogoutStatus);
  const isLoggingOut = logoutStatus === "pending";

  const visibleItems = user
    ? navigationItems.filter((item) => canAccess(item.allowedRoles, user.role))
    : [];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar color="inherit" elevation={0} position="sticky">
        <Toolbar sx={{ borderBottom: 1, borderColor: "divider", gap: 2 }}>
          <RestaurantMenuIcon color="primary" />
          <Typography sx={{ flexGrow: 1, fontWeight: 700 }} variant="h6">
            Restaurant RMS
          </Typography>
          {user && (
            <Typography
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
              variant="body2"
            >
              {user.email} | {user.role}
            </Typography>
          )}
          <Button
            color="inherit"
            disabled={isLoggingOut}
            onClick={handleLogout}
            startIcon={
              isLoggingOut ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <LogoutOutlinedIcon />
              )
            }
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "240px minmax(0, 1fr)" },
            py: 3,
          }}
        >
          <Box component="nav" aria-label="Main navigation">
            <List
              sx={{
                display: { xs: "flex", md: "block" },
                gap: 0.5,
                overflowX: "auto",
                p: 0,
              }}
            >
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isSelected = location.pathname === item.path;

                return (
                  <ListItemButton
                    component={RouterLink}
                    key={item.path}
                    selected={isSelected}
                    sx={{
                      borderRadius: 1,
                      flexShrink: 0,
                      mb: { md: 0.5 },
                    }}
                    to={item.path}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>

          <Stack component="main" spacing={3}>
            <Outlet />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
