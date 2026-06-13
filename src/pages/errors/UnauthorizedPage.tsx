import { Button, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

export const UnauthorizedPage = () => (
  <Container component="main" maxWidth="sm" sx={{ py: 12 }}>
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography color="primary" sx={{ fontWeight: 700 }}>
        403
      </Typography>
      <Typography component="h1" variant="h3">
        Access denied
      </Typography>
      <Typography color="text.secondary">
        Your account does not have permission to access this page.
      </Typography>
      <Button component={RouterLink} to={ROUTES.dashboard} variant="contained">
        Return to dashboard
      </Button>
    </Stack>
  </Container>
);
