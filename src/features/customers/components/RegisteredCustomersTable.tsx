import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
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
import type { RegisteredCustomer } from "../types/adminCustomers.types";

interface RegisteredCustomersTableProps {
  customers: RegisteredCustomer[];
  onEdit: (customer: RegisteredCustomer) => void;
  onView: (customer: RegisteredCustomer) => void;
  onToggleActive: (customer: RegisteredCustomer) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export const RegisteredCustomersTable = ({
  customers,
  onEdit,
  onView,
  onToggleActive,
}: RegisteredCustomersTableProps) => {
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
            No registered customers found
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            No registered customer accounts exist or match the search.
          </Typography>
        </Stack>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="Registered customers management table">
              <TableHead>
                <TableRow>
                  <TableCell>Customer Details</TableCell>
                  <TableCell>Contact Info</TableCell>
                  <TableCell align="right">Total Orders</TableCell>
                  <TableCell align="right">Total Spent</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((customer) => (
                  <TableRow hover key={customer.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {customer.firstName} {customer.lastName}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        ID: #{customer.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.email}</Typography>
                      {customer.phoneNumber && (
                        <Typography color="text.secondary" variant="caption">
                          {customer.phoneNumber}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{customer.totalOrders}</TableCell>
                    <TableCell align="right">
                      {currencyFormatter.format(customer.totalSpent)}
                    </TableCell>
                    <TableCell>
                      {dateFormatter.format(new Date(customer.createdDate))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={customer.isActive ? "success" : "default"}
                        label={customer.isActive ? "Active" : "Deactivated"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="View History">
                          <IconButton
                            aria-label={`View history of ${customer.firstName}`}
                            onClick={() => onView(customer)}
                            size="small"
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Profile">
                          <IconButton
                            aria-label={`Edit ${customer.firstName}`}
                            onClick={() => onEdit(customer)}
                            size="small"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={customer.isActive ? "Deactivate" : "Activate"}>
                          <IconButton
                            aria-label={`Toggle active for ${customer.firstName}`}
                            color={customer.isActive ? "warning" : "success"}
                            onClick={() => onToggleActive(customer)}
                            size="small"
                          >
                            {customer.isActive ? (
                              <ToggleOnIcon fontSize="medium" />
                            ) : (
                              <ToggleOffIcon fontSize="medium" />
                            )}
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
