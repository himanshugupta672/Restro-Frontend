import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

const getCustomerMenuUrl = () => {
  if (typeof window === "undefined") {
    return ROUTES.customerMenu;
  }

  return new URL(ROUTES.customerMenu, window.location.origin).toString();
};

export const RestaurantQrPanel = () => {
  const customerMenuUrl = getCustomerMenuUrl();
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=148x148&data=${encodeURIComponent(
    customerMenuUrl
  )}`;

  const copyUrl = () => {
    void navigator.clipboard?.writeText(customerMenuUrl);
  };

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        p: 1.5,
      }}
    >
      <Stack spacing={1.25}>
        <Stack spacing={0.25}>
          <Typography component="h2" sx={{ fontWeight: 700 }} variant="subtitle2">
            Restaurant QR
          </Typography>
          <Typography color="text.secondary" variant="caption">
            Shared menu link for guest ordering.
          </Typography>
        </Stack>
        <Paper
          alt="Restaurant customer menu QR code"
          component="img"
          elevation={0}
          src={qrImageUrl}
          sx={{
            alignSelf: "center",
            border: 1,
            borderColor: "divider",
            height: 148,
            width: 148,
          }}
        />
        <Typography
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            overflowWrap: "anywhere",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
          title={customerMenuUrl}
          variant="caption"
        >
          {customerMenuUrl}
        </Typography>
        <Stack spacing={1}>
          <Button
            component={RouterLink}
            fullWidth
            size="small"
            startIcon={<OpenInNewOutlinedIcon />}
            to={ROUTES.customerMenu}
            variant="contained"
          >
            Open menu
          </Button>
          <Button
            fullWidth
            onClick={copyUrl}
            size="small"
            startIcon={<ContentCopyOutlinedIcon />}
            variant="outlined"
          >
            Copy URL
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
