import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Chip,
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
import type { RestaurantTable } from "../types/tables.types";

interface TablesTableProps {
  onCopyToken: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onEdit: (table: RestaurantTable) => void;
  tables: RestaurantTable[];
}

export const TablesTable = ({
  onCopyToken,
  onDelete,
  onEdit,
  tables,
}: TablesTableProps) => {
  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    paginatedItems,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination(tables);

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
    >
      {tables.length === 0 ? (
        <Stack spacing={1} sx={{ alignItems: "center", p: 6 }}>
          <Typography component="h2" variant="h6">
            No tables found
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            Add restaurant tables to generate customer ordering sessions.
          </Typography>
        </Stack>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="Restaurant tables">
              <TableHead>
                <TableRow>
                  <TableCell>Table</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Session token</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((table) => (
                  <TableRow hover key={table.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        Table {table.tableNumber}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        ID: #{table.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={table.isActive ? "success" : "default"}
                        label={table.isActive ? "Active" : "Inactive"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography noWrap variant="body2">
                        {table.token || "Not generated"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="Copy session token">
                          <span>
                            <IconButton
                              aria-label={`Copy token for table ${table.tableNumber}`}
                              disabled={!table.token}
                              onClick={() => onCopyToken(table)}
                              size="small"
                            >
                              <ContentCopyOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Edit table">
                          <IconButton
                            aria-label={`Edit table ${table.tableNumber}`}
                            onClick={() => onEdit(table)}
                            size="small"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete table">
                          <IconButton
                            aria-label={`Delete table ${table.tableNumber}`}
                            color="error"
                            onClick={() => onDelete(table)}
                            size="small"
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
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
