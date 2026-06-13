import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

const plannedModules = [
  "Authentication",
  "Dashboard",
  "Menu",
  "Orders",
  "Customers",
  "Reports",
] as const;

export const WelcomePage = () => (
  <Box component="main" sx={{ minHeight: "100vh", py: { xs: 6, md: 12 } }}>
    <Container maxWidth="md">
      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 5 }}>
        <Stack spacing={3}>
          <RestaurantMenuIcon color="primary" sx={{ fontSize: 48 }} />
          <Typography component="h1" variant="h3">
            Restaurant Management System
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
            The React, TypeScript, Redux Toolkit, routing, validation, and
            Material UI foundation is ready. Features will be added as isolated
            business modules with shared infrastructure kept intentionally
            small.
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {plannedModules.map((module) => (
              <Chip key={module} label={module} variant="outlined" />
            ))}
          </Stack>
          <Box>
            <Button
              component={RouterLink}
              to={ROUTES.login}
              variant="contained"
            >
              Continue to sign in
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  </Box>
);
