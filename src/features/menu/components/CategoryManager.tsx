import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { usePagination } from "@/hooks/usePagination";

import type { Category } from "../types/menu.types";

interface CategoryManagerProps {
  categories: Category[];
  menuItemCounts: Record<number, number>;
  onAdd: () => void;
  onDelete: (category: Category) => void;
  onEdit: (category: Category) => void;
}

export const CategoryManager = ({
  categories,
  menuItemCounts,
  onAdd,
  onDelete,
  onEdit,
}: CategoryManagerProps) => {
  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    paginatedItems,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination(categories);

  return (
  <Paper
    component="section"
    elevation={0}
    sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
  >
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        justifyContent: "space-between",
        p: 3,
      }}
    >
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h6">
          Categories
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Organize menu items and control their display order.
        </Typography>
      </Stack>
      <Button
        onClick={onAdd}
        startIcon={<AddOutlinedIcon />}
        variant="outlined"
      >
        Add category
      </Button>
    </Stack>

    {categories.length === 0 ? (
      <Typography color="text.secondary" sx={{ px: 3, pb: 3 }}>
        Add a category before creating menu items.
      </Typography>
    ) : (
      <>
        <TableContainer>
          <Table aria-label="Menu categories">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Display order</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((category) => (
                <TableRow hover key={category.id}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{category.displayOrder}</TableCell>
                  <TableCell align="right">
                    {menuItemCounts[category.id] ?? 0}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit category">
                      <IconButton
                        aria-label={`Edit ${category.name}`}
                        onClick={() => onEdit(category)}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        (menuItemCounts[category.id] ?? 0) > 0
                          ? "Remove category items before deleting"
                          : "Delete category"
                      }
                    >
                      <span>
                        <IconButton
                          aria-label={`Delete ${category.name}`}
                          color="error"
                          disabled={(menuItemCounts[category.id] ?? 0) > 0}
                          onClick={() => onDelete(category)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      </>
    )}
  </Paper>
  );
};
