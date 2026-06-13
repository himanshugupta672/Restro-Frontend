import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
  <Box
    component="main"
    sx={{
      alignItems: "center",
      display: "flex",
      minHeight: "100vh",
      py: 4,
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
  </Box>
);
