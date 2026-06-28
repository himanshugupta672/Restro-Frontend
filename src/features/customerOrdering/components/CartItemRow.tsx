import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import {
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { CartItem } from "../types/customerOrdering.types";

interface CartItemRowProps {
  item: CartItem;
  onDecrement: (id: number) => void;
  onIncrement: (item: CartItem) => void;
  onRemove: (id: number) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const CartItemRow = ({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemRowProps) => (
  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2 }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2,
        justifyContent: "space-between",
      }}
    >
      <Stack spacing={0.5}>
        <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
        <Typography color="text.secondary" variant="body2">
          {currencyFormatter.format(item.price)} each
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <IconButton
          aria-label={`Decrease ${item.name}`}
          onClick={() => onDecrement(item.id)}
          size="small"
        >
          <RemoveOutlinedIcon />
        </IconButton>
        <Typography
          aria-label={`${item.quantity} ${item.name}`}
          sx={{ minWidth: 28, textAlign: "center" }}
        >
          {item.quantity}
        </Typography>
        <IconButton
          aria-label={`Increase ${item.name}`}
          onClick={() => onIncrement(item)}
          size="small"
        >
          <AddOutlinedIcon />
        </IconButton>
        <Typography sx={{ minWidth: 90, textAlign: "right" }}>
          {currencyFormatter.format(item.price * item.quantity)}
        </Typography>
        <IconButton
          aria-label={`Remove ${item.name}`}
          color="error"
          onClick={() => onRemove(item.id)}
        >
          <DeleteOutlineOutlinedIcon />
        </IconButton>
      </Stack>
    </Stack>
  </Paper>
);
