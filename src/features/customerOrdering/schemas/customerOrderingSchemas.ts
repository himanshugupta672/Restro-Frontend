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

export const customerCategoriesSchema = z.array(
  z.object({
    displayOrder: z.coerce.number().int().min(0),
    id: z.coerce.number().int().positive(),
    name: z.string().trim().min(1),
  })
);

export const customerMenuItemsSchema = z.array(
  z.object({
    categoryId: z.coerce.number().int().positive(),
    description: z.string(),
    id: z.coerce.number().int().positive(),
    imageUrl: z
      .string()
      .nullable()
      .optional()
      .transform((value) => value ?? null),
    isAvailable: z.boolean(),
    name: z.string().trim().min(1),
    prepTimeMinutes: z.coerce.number().int().min(0),
    price: z.coerce.number().nonnegative(),
  })
);

export const customerOrderSchema = z.object({
  createdAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value))),
  items: z.array(
    z.object({
      lineTotal: z.coerce.number().nonnegative(),
      menuItemId: z.coerce.number().int().positive(),
      name: z.string().trim().min(1),
      price: z.coerce.number().nonnegative(),
      quantity: z.coerce.number().int().positive(),
    })
  ),
  orderId: z.coerce.number().int().positive(),
  status: z.union([numericOrderStatusSchema, stringOrderStatusSchema]),
  tableId: z.coerce.number().int().positive(),
  tableNumber: z.coerce.number().int().positive(),
  totalAmount: z.coerce.number().nonnegative(),
});

export const customerCheckoutSchema = z.object({
  tableNumber: z
    .number()
    .int("Enter a whole table number.")
    .positive("Table number is required."),
});

export type CustomerCheckoutFormValues = z.infer<
  typeof customerCheckoutSchema
>;

const persistedCartItemSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  description: z.string(),
  id: z.coerce.number().int().positive(),
  imageUrl: z.string().nullable(),
  name: z.string().min(1),
  prepTimeMinutes: z.coerce.number().int().min(0),
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().positive(),
});

export const persistedCustomerSessionSchema = z.object({
  cart: z.array(persistedCartItemSchema),
  currentOrder: customerOrderSchema.nullable(),
  tableNumber: z.coerce.number().int().positive().nullable(),
});
