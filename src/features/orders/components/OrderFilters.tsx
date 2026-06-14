import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { InputAdornment, MenuItem, Paper, TextField } from "@mui/material";

import { ORDER_STATUSES } from "@/types/order";

import type { OrderStatusFilter } from "../types/order.types";

interface OrderFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatusFilter) => void;
  search: string;
  status: OrderStatusFilter;
}

export const OrderFilters = ({
  onSearchChange,
  onStatusChange,
  search,
  status,
}: OrderFiltersProps) => (
  <Paper
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      display: "grid",
      gap: 2,
      gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 1fr) 220px" },
      p: 2,
    }}
  >
    <TextField
      label="Search orders"
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Order, table, chef, or menu item"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon />
            </InputAdornment>
          ),
        },
      }}
      value={search}
    />
    <TextField
      label="Status"
      onChange={(event) =>
        onStatusChange(event.target.value as OrderStatusFilter)
      }
      select
      value={status}
    >
      <MenuItem value="all">All statuses</MenuItem>
      {ORDER_STATUSES.map((orderStatus) => (
        <MenuItem key={orderStatus} value={orderStatus}>
          {orderStatus}
        </MenuItem>
      ))}
    </TextField>
  </Paper>
);
