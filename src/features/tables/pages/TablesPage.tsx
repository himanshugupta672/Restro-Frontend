import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TableRestaurantOutlinedIcon from "@mui/icons-material/TableRestaurantOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
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
import { useEffect, useMemo, useState } from "react";

import { useAppDispatch } from "@/hooks/reduxHooks";
import { normalizeApiError } from "@/services/api";
import { notificationEnqueued } from "@/store/appStatus";
import { createTable, deleteTable, getTables, updateTable } from "../api/tablesApi";
import { TableFormDialog } from "../components/TableFormDialog";
import { TablesTable } from "../components/TablesTable";
import type { CreateTableInput, RestaurantTable } from "../types/tables.types";

export const TablesPage = () => {
  const dispatch = useAppDispatch();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [tableToDelete, setTableToDelete] = useState<RestaurantTable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTables = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTables(signal);
      setTables(data.sort((a, b) => a.tableNumber - b.tableNumber));
    } catch (err: unknown) {
      const apiError = normalizeApiError(err);
      if (!apiError.isCanceled) {
        setError(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchTables(controller.signal);
    return () => controller.abort();
  }, []);

  const metrics = useMemo(
    () => ({
      total: tables.length,
      active: tables.filter((table) => table.isActive).length,
      withTokens: tables.filter((table) => Boolean(table.token)).length,
    }),
    [tables]
  );

  const existingTableNumbers = useMemo(
    () => tables.map((table) => table.tableNumber),
    [tables]
  );

  const handleCreate = async (input: CreateTableInput) => {
    if (selectedTable) {
      await updateTable(selectedTable.id, input);
      dispatch(notificationEnqueued("Table updated successfully.", "success"));
    } else {
      await createTable(input);
      dispatch(notificationEnqueued("Table added successfully.", "success"));
    }

    setFormOpen(false);
    setSelectedTable(null);
    await fetchTables();
  };

  const handleOpenCreate = () => {
    setSelectedTable(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (table: RestaurantTable) => {
    setSelectedTable(table);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!tableToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTable(tableToDelete.id);
      dispatch(notificationEnqueued("Table deleted successfully.", "success"));
      setTableToDelete(null);
      await fetchTables();
    } catch (err: unknown) {
      dispatch(notificationEnqueued(normalizeApiError(err).message, "error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyToken = async (table: RestaurantTable) => {
    await navigator.clipboard.writeText(table.token);
    dispatch(
      notificationEnqueued(`Session token copied for table ${table.tableNumber}.`, "success")
    );
  };

  const isInitialLoading = loading && tables.length === 0;

  return (
    <Stack spacing={3}>
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
            Table management
          </Typography>
          <Typography color="text.secondary">
            Create table sessions and remove tables that are no longer used.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            disabled={loading}
            onClick={() => fetchTables()}
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
            Add Table
          </Button>
        </Stack>
      </Stack>

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
          icon={<TableRestaurantOutlinedIcon color="primary" sx={{ fontSize: 32 }} />}
          label="Total tables"
          value={metrics.total}
        />
        <MetricCard
          icon={<CheckCircleOutlineOutlinedIcon color="success" sx={{ fontSize: 32 }} />}
          label="Active tables"
          value={metrics.active}
        />
        <MetricCard
          icon={<LinkOutlinedIcon color="info" sx={{ fontSize: 32 }} />}
          label="Session tokens"
          value={metrics.withTokens}
        />
      </Box>

      {error && (
        <Alert
          action={
            <Button color="inherit" onClick={() => fetchTables()} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          {error}
        </Alert>
      )}

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
            <Typography color="text.secondary">Loading tables...</Typography>
          </Stack>
        </Paper>
      ) : (
        <TablesTable
          onCopyToken={handleCopyToken}
          onDelete={setTableToDelete}
          onEdit={handleOpenEdit}
          tables={tables}
        />
      )}

      <TableFormDialog
        existingTableNumbers={existingTableNumbers}
        onClose={() => {
          setFormOpen(false);
          setSelectedTable(null);
        }}
        onSubmit={handleCreate}
        open={formOpen}
        table={selectedTable}
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={isDeleting ? undefined : () => setTableToDelete(null)}
        open={Boolean(tableToDelete)}
      >
        <DialogTitle>Delete Table?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete table {tableToDelete?.tableNumber}? This cannot be undone.
            Tables with existing orders may be protected by the database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isDeleting} onClick={() => setTableToDelete(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            disabled={isDeleting}
            onClick={handleDelete}
            startIcon={
              isDeleting ? <CircularProgress color="inherit" size={18} /> : null
            }
            variant="contained"
          >
            {isDeleting ? "Deleting..." : "Delete"}
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
      alignItems: "center",
      border: 1,
      borderColor: "divider",
      display: "flex",
      justifyContent: "space-between",
      p: 2.5,
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
