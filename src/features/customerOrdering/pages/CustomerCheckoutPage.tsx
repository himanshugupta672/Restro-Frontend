import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  customerOrderConfirmationPath,
  ROUTES,
} from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import {
  customerCheckoutSchema,
  type CustomerCheckoutFormValues,
} from "../schemas/customerOrderingSchemas";
import {
  customerOrderErrorCleared,
  customerTableNumberSet,
  selectCustomerOrdering,
} from "../store/customerOrderingSlice";
import { submitCustomerOrder } from "../store/customerOrderingThunks";
import { getCartTotal } from "../utils/customerSession";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

export const CustomerCheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ordering = useAppSelector(selectCustomerOrdering);
  const total = getCartTotal(ordering);
  const isSubmitting = ordering.placementStatus === "pending";
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerCheckoutFormValues>({
    defaultValues: {
      tableNumber: ordering.tableNumber ?? ("" as unknown as number),
      specialInstructions: "",
    },
    resolver: zodResolver(customerCheckoutSchema),
  });

  if (ordering.cart.length === 0) {
    return (
      <Stack spacing={3}>
        <Typography component="h1" variant="h4">
          Checkout
        </Typography>
        <Alert
          action={
            <Button
              color="inherit"
              component={RouterLink}
              to={ROUTES.customerMenu}
              size="small"
            >
              Browse menu
            </Button>
          }
          severity="warning"
        >
          Your cart is empty. Add items to your cart before checking out.
        </Alert>
      </Stack>
    );
  }

  const handlePlaceOrder = handleSubmit(async ({ tableNumber }) => {
    dispatch(customerOrderErrorCleared());
    dispatch(customerTableNumberSet(tableNumber));

    const result = await dispatch(
      submitCustomerOrder({
        items: ordering.cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        tableNumber,
      })
    );

    if (submitCustomerOrder.fulfilled.match(result)) {
      navigate(customerOrderConfirmationPath(result.payload.orderId), {
        replace: true,
      });
    }
  });

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography component="h1" variant="h4">
          Confirm your order
        </Typography>
        <Typography color="text.secondary">
          Enter your table number so the kitchen can serve the right table.
        </Typography>
      </Stack>

      {ordering.placementError && (
        <Alert severity="error">{ordering.placementError.message}</Alert>
      )}

      <Paper
        component="form"
        elevation={0}
        noValidate
        onSubmit={handlePlaceOrder}
        sx={{ border: 1, borderColor: "divider", p: 3 }}
      >
        <Stack spacing={2}>
          <Controller
            control={control}
            name="tableNumber"
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                disabled={isSubmitting}
                error={Boolean(errors.tableNumber)}
                fullWidth
                helperText={
                  errors.tableNumber?.message ??
                  "Use the table number displayed at your table."
                }
                label="Table number"
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === "" ? "" : Number(value));
                }}
                slotProps={{ htmlInput: { min: 1, inputMode: "numeric" } }}
                type="number"
              />
            )}
          />

          <Controller
            control={control}
            name="specialInstructions"
            render={({ field }) => (
              <TextField
                {...field}
                disabled={isSubmitting}
                fullWidth
                helperText="Optional: allergies, preferences, special requests."
                label="Special instructions"
                multiline
                rows={2}
                value={field.value ?? ""}
              />
            )}
          />

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Order summary
          </Typography>

          {ordering.cart.map((item) => (
            <Stack
              direction="row"
              key={item.id}
              sx={{ gap: 2, justifyContent: "space-between" }}
            >
              <Typography>
                {item.quantity} × {item.name}
              </Typography>
              <Typography sx={{ flexShrink: 0 }}>
                {currencyFormatter.format(item.price * item.quantity)}
              </Typography>
            </Stack>
          ))}
          <Divider />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700 }}>Total</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {currencyFormatter.format(total)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button
          component={RouterLink}
          disabled={isSubmitting}
          fullWidth
          to={ROUTES.customerCart}
        >
          Back to cart
        </Button>
        <Button
          disabled={isSubmitting}
          fullWidth
          onClick={handlePlaceOrder}
          startIcon={
            isSubmitting ? <CircularProgress color="inherit" size={18} /> : null
          }
          variant="contained"
        >
          {isSubmitting ? "Placing order..." : "Place order"}
        </Button>
      </Stack>
    </Stack>
  );
};
