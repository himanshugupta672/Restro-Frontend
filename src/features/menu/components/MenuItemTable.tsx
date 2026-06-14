import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import type { Category, MenuItem } from "../types/menu.types";
import { getCategoryName } from "../utils/menuFilters";

interface MenuItemTableProps {
  categories: Category[];
  menuItems: MenuItem[];
  onDelete: (menuItem: MenuItem) => void;
  onEdit: (menuItem: MenuItem) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

export const MenuItemTable = ({
  categories,
  menuItems,
  onDelete,
  onEdit,
}: MenuItemTableProps) => (
  <Paper
    component="section"
    elevation={0}
    sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
  >
    {menuItems.length === 0 ? (
      <Stack spacing={1} sx={{ alignItems: "center", p: 6 }}>
        <Typography component="h2" variant="h6">
          No menu items found
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          Add a menu item or adjust the current filters.
        </Typography>
      </Stack>
    ) : (
      <TableContainer>
        <Table aria-label="Menu items">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Prep time</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menuItems.map((menuItem) => (
              <TableRow hover key={menuItem.id}>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center", minWidth: 260 }}
                  >
                    <Avatar
                      alt=""
                      src={menuItem.imageUrl ?? undefined}
                      sx={{ bgcolor: "primary.main" }}
                    >
                      {menuItem.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Stack spacing={0.25}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {menuItem.name}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          maxWidth: 360,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        variant="body2"
                      >
                        {menuItem.description}
                      </Typography>
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  {getCategoryName(categories, menuItem.categoryId)}
                </TableCell>
                <TableCell>
                  <Chip
                    color={menuItem.isAvailable ? "success" : "default"}
                    label={menuItem.isAvailable ? "Available" : "Unavailable"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{menuItem.prepTimeMinutes} min</TableCell>
                <TableCell align="right">
                  {currencyFormatter.format(menuItem.price)}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit menu item">
                    <IconButton
                      aria-label={`Edit ${menuItem.name}`}
                      onClick={() => onEdit(menuItem)}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete menu item">
                    <IconButton
                      aria-label={`Delete ${menuItem.name}`}
                      color="error"
                      onClick={() => onDelete(menuItem)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Paper>
);
