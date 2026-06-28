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

export const rawOrderSchema = z.object({
  chefId: z.coerce.number().int().positive().nullable().optional(),
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

export const rawOrdersSchema = z.array(rawOrderSchema);

export const orderMenuItemsSchema = z.array(
  z.object({
    id: z.coerce.number().int().positive(),
    name: z.string().trim().min(1),
  })
);

export const chefsSchema = z.array(
  z.object({
    id: z.coerce.number().int().positive(),
    name: z.string().trim().min(1),
    status: z.string().trim().min(1).catch("Unknown"),
    isActive: z.boolean().catch(true),
  })
);

export type RawOrder = z.infer<typeof rawOrderSchema>;
