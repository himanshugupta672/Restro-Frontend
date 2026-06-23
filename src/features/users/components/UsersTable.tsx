import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
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
import type { User } from "../types/users.types";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const getRoleColor = (role: User["role"]) => {
  switch (role) {
    case "Admin":
      return "error";
    case "Chef":
      return "info";
    case "Customer":
      return "default";
    default:
      return "default";
  }
};

const getStatusColor = (status: User["status"]) => {
  switch (status) {
    case "Available":
      return "success";
    case "Busy":
      return "warning";
    case "Offline":
      return "default";
    default:
      return "default";
  }
};

export const UsersTable = ({ users, onEdit, onDelete }: UsersTableProps) => {
  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    paginatedItems,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination(users);

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
    >
      {users.length === 0 ? (
        <Stack spacing={1} sx={{ alignItems: "center", p: 6 }}>
          <Typography component="h2" variant="h6">
            No users found
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            No registered users exist or match the filters.
          </Typography>
        </Stack>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="User management table">
              <TableHead>
                <TableRow>
                  <TableCell>User details</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Contact details</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                      <Typography color="text.secondary" variant="caption">
                        ID: #{user.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getRoleColor(user.role)}
                        label={user.role}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(user.status)}
                        label={user.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      {user.phoneNumber && (
                        <Typography color="text.secondary" variant="caption">
                          {user.phoneNumber}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography noWrap variant="body2">
                        {user.address || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="Edit User">
                          <IconButton
                            aria-label={`Edit ${user.name}`}
                            onClick={() => onEdit(user)}
                            size="small"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            aria-label={`Delete ${user.name}`}
                            color="error"
                            onClick={() => onDelete(user)}
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
