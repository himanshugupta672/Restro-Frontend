import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { CartItemRow } from "../components/CartItemRow";
import {
  cartItemAdded,
  cartItemDecremented,
  cartItemRemoved,
  selectCustomerOrdering,
} from "../store/customerOrderingSlice";
import { getCartTotal } from "../utils/customerSession";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "INR",
  style: "currency",
});

export const CustomerCartPage = () => {
  const dispatch = useAppDispatch();
  const ordering = useAppSelector(selectCustomerOrdering);
  const total = getCartTotal(ordering);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography component="h1" variant="h4">
          Your cart
        </Typography>
        <Typography color="text.secondary">
          Review your items before entering your table number at checkout.
        </Typography>
      </Stack>

      {ordering.cart.length === 0 ? (
        <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 5 }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Typography component="h2" variant="h6">
              Your cart is empty
            </Typography>
            <Button component={RouterLink} to={ROUTES.customerMenu} variant="contained" replace>
              Browse menu
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <Stack spacing={2}>
            {ordering.cart.map((item) => (
              <CartItemRow
                item={item}
                key={item.id}
                onDecrement={(id) => dispatch(cartItemDecremented(id))}
                onIncrement={(cartItem) => dispatch(cartItemAdded(cartItem))}
                onRemove={(id) => dispatch(cartItemRemoved(id))}
              />
            ))}
          </Stack>
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography>Subtotal</Typography>
                <Typography>{currencyFormatter.format(total)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {currencyFormatter.format(total)}
                </Typography>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button component={RouterLink} fullWidth to={ROUTES.customerMenu} replace>
                  Add more items
                </Button>
                <Button
                  component={RouterLink}
                  fullWidth
                  to={ROUTES.customerCheckout}
                  variant="contained"
                >
                  Continue to checkout
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
};
