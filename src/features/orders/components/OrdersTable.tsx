import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
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

import { USER_ROLES, type UserRole } from "@/features/auth";

import type { Order } from "../types/order.types";
import {
  canChefAcceptOrReject,
  getPrimaryOrderAction,
} from "../utils/orderWorkflow";
import { OrderStatusChip } from "./OrderStatusChip";

interface OrdersTableProps {
  isMutating: boolean;
  onAccept: (order: Order) => void;
  onAdvance: (order: Order) => void;
  onChangeStatus: (order: Order) => void;
  onReject: (order: Order) => void;
  onView: (order: Order) => void;
  orders: Order[];
  role: UserRole;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const OrdersTable = ({
  isMutating,
  onAccept,
  onAdvance,
  onChangeStatus,
  onReject,
  onView,
  orders,
  role,
}: OrdersTableProps) => {
  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    paginatedItems,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination(orders);

  return (
  <Paper
    component="section"
    elevation={0}
    sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
  >
    {orders.length === 0 ? (
      <Stack spacing={1} sx={{ alignItems: "center", p: 6 }}>
        <Typography component="h2" variant="h6">
          No orders found
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          There are no orders matching the current filters.
        </Typography>
      </Stack>
    ) : (
      <>
        <TableContainer>
          <Table aria-label="Restaurant orders">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Table</TableCell>
                <TableCell>Status</TableCell>
                {role === USER_ROLES.admin && <TableCell>Chef</TableCell>}
                <TableCell>Created</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((order) => {
                const primaryAction = getPrimaryOrderAction(order, role);
                const chefDecision = canChefAcceptOrReject(order);

                return (
                  <TableRow hover key={order.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.tableNumber}</TableCell>
                    <TableCell>
                      <OrderStatusChip status={order.status} />
                    </TableCell>
                    {role === USER_ROLES.admin && (
                      <TableCell>{order.chefName ?? "Unassigned"}</TableCell>
                    )}
                    <TableCell>
                      {dateFormatter.format(new Date(order.createdAt))}
                    </TableCell>
                    <TableCell align="right">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(order.totalAmount)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ justifyContent: "flex-end", minWidth: 190 }}
                      >
                        <Tooltip title="View order">
                          <IconButton
                            aria-label={`View order ${order.id}`}
                            onClick={() => onView(order)}
                          >
                            <VisibilityOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        {role === USER_ROLES.admin && (
                          <Button
                            disabled={isMutating}
                            onClick={() => onChangeStatus(order)}
                            size="small"
                            variant="outlined"
                          >
                            Update
                          </Button>
                        )}
                        {role === USER_ROLES.chef && chefDecision && (
                          <>
                            <Button
                              disabled={isMutating}
                              onClick={() => onReject(order)}
                              size="small"
                            >
                              Reject
                            </Button>
                            <Button
                              disabled={isMutating}
                              onClick={() => onAccept(order)}
                              size="small"
                              variant="contained"
                            >
                              Accept
                            </Button>
                          </>
                        )}
                        {role === USER_ROLES.chef && primaryAction && (
                          <Button
                            disabled={isMutating}
                            onClick={() => onAdvance(order)}
                            size="small"
                            variant="contained"
                          >
                            {primaryAction.label}
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
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
