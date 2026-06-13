import { Button, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

export const NotFoundPage = () => (
  <Container component="main" maxWidth="sm" sx={{ py: 12 }}>
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography color="primary" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography component="h1" variant="h3">
        Page not found
      </Typography>
      <Typography color="text.secondary">
        The requested page does not exist or may have moved.
      </Typography>
      <Button component={RouterLink} to={ROUTES.home} variant="contained">
        Return home
      </Button>
    </Stack>
  </Container>
);
