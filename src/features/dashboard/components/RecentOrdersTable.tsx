import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

import { usePagination } from "@/hooks/usePagination";
import type { OrderStatus } from "@/types/order";

import type { DashboardOrder } from "../types/dashboard.types";

interface RecentOrdersTableProps {
  orders: DashboardOrder[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

const statusColors: Record<
  OrderStatus,
  "default" | "error" | "info" | "success" | "warning"
> = {
  Accepted: "info",
  Assigned: "info",
  Cancelled: "error",
  Completed: "success",
  Pending: "warning",
  Preparing: "warning",
  Ready: "success",
};

export const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    paginatedItems,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination(orders, {
    defaultRowsPerPage: 5,
    rowsPerPageOptions: [5, 10, 25],
  });

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
    >
      <Typography component="h2" sx={{ px: 3, pt: 3 }} variant="h6">
        Recent orders
      </Typography>
      <Typography color="text.secondary" sx={{ px: 3, pb: 2 }} variant="body2">
        The most recently created orders.
      </Typography>

      {orders.length === 0 ? (
        <Typography color="text.secondary" sx={{ px: 3, pb: 3 }}>
          No orders are available yet.
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="Recent orders">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Table</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.tableNumber}</TableCell>
                    <TableCell>
                      <Chip
                        color={statusColors[order.status]}
                        label={order.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {dateFormatter.format(new Date(order.createdAt))}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(order.totalAmount)}
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
