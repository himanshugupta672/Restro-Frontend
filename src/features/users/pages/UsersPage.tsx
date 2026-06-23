import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SupervisedUserCircleOutlinedIcon from "@mui/icons-material/SupervisedUserCircleOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";

import { useAppDispatch } from "@/hooks/reduxHooks";
import { notificationEnqueued } from "@/store/appStatus";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/usersApi";
import { UsersTable } from "../components/UsersTable";
import { UserFormDialog } from "../components/UserFormDialog";
import type { User } from "../types/users.types";

export const UsersPage = () => {
  const dispatch = useAppDispatch();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Dialog states
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers(signal);
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const handleRefresh = () => {
    fetchUsers();
  };

  // Metrics
  const metrics = useMemo(() => {
    const admins = users.filter((u) => u.role === "Admin").length;
    const chefs = users.filter((u) => u.role === "Chef").length;
    return {
      total: users.length,
      admins,
      chefs,
    };
  }, [users]);

  // Create or Update submit handler
  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        // Edit User
        await updateUser(selectedUser.id, data);
        dispatch(notificationEnqueued("User updated successfully.", "success"));
      } else {
        // Create User
        await createUser(data);
        dispatch(notificationEnqueued("User created successfully.", "success"));
      }
      setFormOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || "Operation failed.";
      dispatch(notificationEnqueued(msg, "error"));
      throw err; // FormDialog handles loading states
    }
  };

  // Delete submit handler
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      dispatch(notificationEnqueued("User deleted successfully.", "success"));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || "Failed to delete user.";
      dispatch(notificationEnqueued(msg, "error"));
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const isInitialLoading = loading && users.length === 0;

  return (
    <Stack spacing={3}>
      {/* Page Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={0.5}>
          <Typography component="h1" variant="h4">
            User management
          </Typography>
          <Typography color="text.secondary">
            Manage admin and chef accounts, access levels, and registration statuses.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            disabled={loading}
            onClick={handleRefresh}
            startIcon={
              loading && !isInitialLoading ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <RefreshOutlinedIcon />
              )
            }
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            onClick={handleOpenCreate}
            startIcon={<AddOutlinedIcon />}
            variant="contained"
          >
            Add User
          </Button>
        </Stack>
      </Stack>

      {/* Metrics Cards */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        <MetricCard
          icon={<SupervisedUserCircleOutlinedIcon color="primary" sx={{ fontSize: 32 }} />}
          label="Total staff"
          value={metrics.total}
        />
        <MetricCard
          icon={<SecurityOutlinedIcon color="error" sx={{ fontSize: 32 }} />}
          label="Administrators"
          value={metrics.admins}
        />
        <MetricCard
          icon={<EngineeringOutlinedIcon color="info" sx={{ fontSize: 32 }} />}
          label="Chefs"
          value={metrics.chefs}
        />
      </Box>

      {error && (
        <Alert
          action={
            <Button color="inherit" onClick={handleRefresh} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          {error}
        </Alert>
      )}

      {/* Main Table */}
      {isInitialLoading ? (
        <Paper
          elevation={0}
          sx={{
            alignItems: "center",
            border: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            minHeight: 320,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary">
              Loading users data...
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <UsersTable
          onDelete={handleOpenDelete}
          onEdit={handleOpenEdit}
          users={users}
        />
      )}

      {/* Add / Edit Dialog */}
      <UserFormDialog
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        open={formOpen}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        onClose={() => setDeleteConfirmOpen(false)}
        open={deleteConfirmOpen}
      >
        <DialogTitle>Delete User Account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the account for{" "}
            <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const MetricCard = ({ icon, label, value }: MetricCardProps) => (
  <Paper
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      p: 2.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Stack spacing={0.5}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography component="p" sx={{ fontWeight: 700 }} variant="h4">
        {value}
      </Typography>
    </Stack>
    {icon}
  </Paper>
);
