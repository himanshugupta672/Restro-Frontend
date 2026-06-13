import { Box, CircularProgress } from "@mui/material";

export const PageLoader = () => (
  <Box
    role="status"
    sx={{
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      minHeight: "100vh",
    }}
  >
    <CircularProgress aria-label="Loading page" />
  </Box>
);
