import { z } from "zod";

import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

const numericOrderStatusSchema = z
  .number()
  .int()
  .min(0)
  .max(ORDER_STATUSES.length - 1)
  .transform((status): OrderStatus => ORDER_STATUSES[status] ?? "Pending");

const stringOrderStatusSchema = z
  .string()
  .transform((status) => {
    const normalized = ORDER_STATUSES.find(
      (candidate) => candidate.toLowerCase() === status.toLowerCase()
    );

    return normalized ?? null;
  })
  .pipe(z.enum(ORDER_STATUSES));

export const rawCustomerOrderSchema = z.object({
  createdAt: z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Order creation date is invalid."
    ),
  id: z.coerce.number().int().positive(),
  orderItems: z.array(
    z.object({
      id: z.coerce.number().int().positive(),
      menuItemId: z.coerce.number().int().positive(),
      price: z.coerce.number().nonnegative(),
      quantity: z.coerce.number().int().positive(),
    })
  ),
  status: z.union([numericOrderStatusSchema, stringOrderStatusSchema]),
  tableId: z.coerce.number().int().positive(),
  tableNumber: z.coerce.number().int().positive(),
  totalAmount: z.coerce.number().nonnegative(),
});

export const rawCustomerOrdersSchema = z.array(rawCustomerOrderSchema);

export const customerMenuItemsSchema = z.array(
  z.object({
    id: z.coerce.number().int().positive(),
    name: z.string().trim().min(1),
  })
);

export type RawCustomerOrder = z.infer<typeof rawCustomerOrderSchema>;
