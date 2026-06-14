import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";

import type { CustomerMenuItem } from "../types/customerOrdering.types";

interface CustomerMenuItemCardProps {
  item: CustomerMenuItem;
  onAdd: (item: CustomerMenuItem) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

export const CustomerMenuItemCard = ({
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
        alt=""
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
          <Typography color="primary" sx={{ fontWeight: 700 }}>
            {currencyFormatter.format(item.price)}
          </Typography>
        </Stack>
        <Typography color="text.secondary">{item.description}</Typography>
        <Typography color="text.secondary" variant="caption">
          About {item.prepTimeMinutes} minutes
        </Typography>
      </Stack>
    </CardContent>
    <CardActions sx={{ p: 2, pt: 0 }}>
      <Button
        fullWidth
        onClick={() => onAdd(item)}
        startIcon={<AddOutlinedIcon />}
        variant="contained"
      >
        Add to cart
      </Button>
    </CardActions>
  </Card>
);
