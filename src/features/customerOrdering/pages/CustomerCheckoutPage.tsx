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
      tableNumber: ordering.tableNumber ?? 1,
    },
    resolver: zodResolver(customerCheckoutSchema),
  });

  if (ordering.cart.length === 0) {
    return (
      <Alert
        action={
          <Button color="inherit" component={RouterLink} to={ROUTES.customerCart}>
            Open cart
          </Button>
        }
        severity="warning"
      >
        Add items to your cart before checking out.
      </Alert>
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

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
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
                onChange={(event) => field.onChange(Number(event.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
                type="number"
              />
            )}
          />
          <Divider />
          {ordering.cart.map((item) => (
            <Stack
              direction="row"
              key={item.id}
              sx={{ gap: 2, justifyContent: "space-between" }}
            >
              <Typography>
                {item.quantity} x {item.name}
              </Typography>
              <Typography>
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
