import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from "@mui/material";

import { ORDER_STATUSES } from "@/types/order";

import type { CustomerFilters as CustomerFiltersValue } from "../types/customer.types";

interface CustomerFiltersProps {
  filters: CustomerFiltersValue;
  onFiltersChange: (filters: CustomerFiltersValue) => void;
}

export const CustomerFilters = ({
  filters,
  onFiltersChange,
}: CustomerFiltersProps) => (
  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2 }}>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField
        fullWidth
        label="Search table, order, or item"
        onChange={(event) =>
          onFiltersChange({ ...filters, search: event.target.value })
        }
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        value={filters.search}
      />
      <TextField
        label="Order status"
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            status: event.target.value as CustomerFiltersValue["status"],
          })
        }
        select
        sx={{ minWidth: { md: 220 } }}
        value={filters.status}
      >
        <MenuItem value="all">All statuses</MenuItem>
        {ORDER_STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  </Paper>
);
