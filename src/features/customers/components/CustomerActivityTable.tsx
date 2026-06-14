import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
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

import type { GuestCustomerSummary } from "../types/customer.types";

interface CustomerActivityTableProps {
  customers: GuestCustomerSummary[];
  onView: (customer: GuestCustomerSummary) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const CustomerActivityTable = ({
  customers,
  onView,
}: CustomerActivityTableProps) => {
  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    paginatedItems,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination(customers);

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
    >
      {customers.length === 0 ? (
        <Stack spacing={1} sx={{ alignItems: "center", p: 6 }}>
          <Typography component="h2" variant="h6">
            No customer activity found
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            No table activity matches the current filters.
          </Typography>
        </Stack>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="Customer activity by table">
              <TableHead>
                <TableRow>
                  <TableCell>Guest table</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Active</TableCell>
                  <TableCell align="right">Completed</TableCell>
                  <TableCell align="right">Total spend</TableCell>
                  <TableCell align="right">Average order</TableCell>
                  <TableCell>Last order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((customer) => (
                  <TableRow hover key={customer.tableNumber}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        Table {customer.tableNumber}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        Table record #{customer.tableId}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{customer.totalOrders}</TableCell>
                    <TableCell align="right">{customer.activeOrders}</TableCell>
                    <TableCell align="right">{customer.completedOrders}</TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(customer.totalRevenue)}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(customer.averageOrderValue)}
                    </TableCell>
                    <TableCell>
                      {dateFormatter.format(new Date(customer.lastOrderAt))}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View table history">
                        <IconButton
                          aria-label={`View table ${customer.tableNumber} history`}
                          onClick={() => onView(customer)}
                        >
                          <VisibilityOutlinedIcon />
                        </IconButton>
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
