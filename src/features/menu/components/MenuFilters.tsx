import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  InputAdornment,
  MenuItem as MuiMenuItem,
  Paper,
  TextField,
} from "@mui/material";

import type { AvailabilityFilter, Category } from "../types/menu.types";

interface MenuFiltersProps {
  availability: AvailabilityFilter;
  categories: Category[];
  categoryId: number | "all";
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  onCategoryChange: (value: number | "all") => void;
  onSearchChange: (value: string) => void;
  search: string;
}

export const MenuFilters = ({
  availability,
  categories,
  categoryId,
  onAvailabilityChange,
  onCategoryChange,
  onSearchChange,
  search,
}: MenuFiltersProps) => (
  <Paper
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      display: "grid",
      gap: 2,
      gridTemplateColumns: {
        xs: "1fr",
        md: "minmax(240px, 1fr) 220px 180px",
      },
      p: 2,
    }}
  >
    <TextField
      label="Search menu"
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search by name or description"
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
      label="Category"
      onChange={(event) =>
        onCategoryChange(
          event.target.value === "all" ? "all" : Number(event.target.value)
        )
      }
      select
      value={categoryId}
    >
      <MuiMenuItem value="all">All categories</MuiMenuItem>
      {categories.map((category) => (
        <MuiMenuItem key={category.id} value={category.id}>
          {category.name}
        </MuiMenuItem>
      ))}
    </TextField>
    <TextField
      label="Availability"
      onChange={(event) =>
        onAvailabilityChange(event.target.value as AvailabilityFilter)
      }
      select
      value={availability}
    >
      <MuiMenuItem value="all">All items</MuiMenuItem>
      <MuiMenuItem value="available">Available</MuiMenuItem>
      <MuiMenuItem value="unavailable">Unavailable</MuiMenuItem>
    </TextField>
  </Paper>
);
