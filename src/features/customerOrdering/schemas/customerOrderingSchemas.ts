import { z } from "zod";

import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

// ---------- Order status (backend may send numeric enum OR string) ----------

const numericOrderStatusSchema = z
  .number()
  .int()
  .min(0)
  .max(ORDER_STATUSES.length - 1)
  .transform((status): OrderStatus => ORDER_STATUSES[status] ?? "Pending");

const stringOrderStatusSchema = z
  .string()
  .transform((status): OrderStatus | null => {
    const normalized = ORDER_STATUSES.find(
      (candidate) => candidate.toLowerCase() === status.toLowerCase()
    );
    return normalized ?? null;
  })
  .pipe(
    z.custom<OrderStatus>((val) => val !== null, {
      message: "Invalid order status string",
    })
  );

const orderStatusSchema = z.union([
  numericOrderStatusSchema,
  stringOrderStatusSchema,
]);

// ---------- Categories ----------

const customerCategoryItemSchema = z
  .object({
    displayOrder: z.coerce.number().int().min(0).catch(0),
    id: z.coerce.number().int().positive(),
    name: z.string().trim().min(1),
  })
  .passthrough();

export const customerCategoriesSchema = z.array(customerCategoryItemSchema);

// ---------- Menu items ----------

const customerMenuItemObjectSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
    description: z
      .string()
      .nullable()
      .optional()
      .transform((value) => value ?? ""),
    id: z.coerce.number().int().positive(),
    imageUrl: z
      .string()
      .nullable()
      .optional()
      .transform((value) => value ?? null),
    isAvailable: z
      .union([z.boolean(), z.coerce.number()])
      .transform((value) => Boolean(value))
      .catch(true),
    name: z.string().trim().min(1),
    prepTimeMinutes: z.coerce.number().int().min(0).catch(0),
    price: z.coerce.number().nonnegative(),
  })
  .passthrough();

export const customerMenuItemsSchema = z.array(customerMenuItemObjectSchema);

// ---------- Customer order response ----------

const customerOrderItemSchema = z
  .object({
    lineTotal: z.coerce.number().nonnegative().catch(0),
    menuItemId: z.coerce.number().int().positive(),
    name: z.string().trim().min(1).catch("Menu item"),
    price: z.coerce.number().nonnegative().catch(0),
    quantity: z.coerce.number().int().positive(),
  })
  .passthrough();

export const customerOrderSchema = z
  .object({
    createdAt: z.string().catch(new Date().toISOString()),
    estimatedReadyAt: z.string().nullable().optional().catch(null),
    estimatedTimeMinutes: z.coerce
      .number()
      .int()
      .positive()
      .nullable()
      .optional()
      .catch(null),
    items: z.array(customerOrderItemSchema).catch([]),
    orderId: z.coerce.number().int().positive(),
    status: orderStatusSchema,
    tableId: z.coerce.number().int().positive(),
    tableNumber: z.coerce.number().int().positive(),
    totalAmount: z.coerce.number().nonnegative().catch(0),
  })
  .passthrough();
export const customerOrdersSchema = z.array(customerOrderSchema);

// ---------- Checkout form ----------

export const customerCheckoutSchema = z.object({
  tableNumber: z
    .number()
    .int("Enter a whole table number.")
    .positive("Table number is required."),
  specialInstructions: z.string().trim(),
});

export type CustomerCheckoutFormValues = z.infer<typeof customerCheckoutSchema>;

// ---------- Persisted session ----------

const persistedCartItemSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  description: z.string().catch(""),
  id: z.coerce.number().int().positive(),
  imageUrl: z.string().nullable().catch(null),
  name: z.string().min(1),
  prepTimeMinutes: z.coerce.number().int().min(0).catch(0),
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().positive(),
});

export const persistedCustomerSessionSchema = z.object({
  activeOrders: z.array(customerOrderSchema).catch([]),
  cart: z.array(persistedCartItemSchema).catch([]),
  tableNumber: z.coerce.number().int().positive().nullable().catch(null),
});
