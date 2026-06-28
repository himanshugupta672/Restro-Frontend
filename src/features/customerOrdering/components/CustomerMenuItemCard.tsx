import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import {
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import type { CustomerMenuItem } from "../types/customerOrdering.types";

interface CustomerMenuItemCardProps {
  cartQuantity?: number;
  detailsPath: string;
  item: CustomerMenuItem;
  onAdd: (item: CustomerMenuItem) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const CustomerMenuItemCard = ({
  cartQuantity = 0,
  detailsPath,
  item,
  onAdd,
}: CustomerMenuItemCardProps) => (
  <Card
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
  >
    {item.imageUrl ? (
      <CardMedia
        alt={item.name}
        component="img"
        height="180"
        image={item.imageUrl}
        sx={{ objectFit: "cover" }}
      />
    ) : (
      <Box
        sx={{
          alignItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          height: 180,
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontWeight: 700 }} variant="h3">
          {item.name.charAt(0).toUpperCase()}
        </Typography>
      </Box>
    )}
    <CardContent sx={{ flexGrow: 1 }}>
      <Stack spacing={1}>
        <Stack direction="row" sx={{ gap: 2, justifyContent: "space-between" }}>
          <Typography component="h3" sx={{ fontWeight: 700 }} variant="h6">
            {item.name}
          </Typography>
          <Typography color="primary" sx={{ fontWeight: 700, flexShrink: 0 }}>
            {currencyFormatter.format(item.price)}
          </Typography>
        </Stack>
        {item.description && (
          <Typography color="text.secondary">{item.description}</Typography>
        )}
        {item.prepTimeMinutes > 0 && (
          <Typography color="text.secondary" variant="caption">
            About {item.prepTimeMinutes} minutes
          </Typography>
        )}
      </Stack>
    </CardContent>
    <CardActions sx={{ p: 2, pt: 0 }}>
      <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
        <Button component={RouterLink} fullWidth to={detailsPath}>
          Details
        </Button>
        <Badge
          badgeContent={cartQuantity}
          color="secondary"
          sx={{ width: "100%" }}
        >
          <Button
            fullWidth
            onClick={() => onAdd(item)}
            startIcon={<AddOutlinedIcon />}
            variant={cartQuantity > 0 ? "outlined" : "contained"}
          >
            {cartQuantity > 0 ? "Add" : "Add"}
          </Button>
        </Badge>
      </Stack>
    </CardActions>
  </Card>
);
