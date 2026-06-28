import { z } from "zod";

export const restaurantTableSchema = z.object({
  id: z.coerce.number().int().positive(),
  tableNumber: z.coerce.number().int().positive(),
  isActive: z.coerce.boolean(),
  token: z.string().catch(""),
});

export const restaurantTablesSchema = z.array(restaurantTableSchema);

export const createTableSchema = z.object({
  tableNumber: z
    .number({ error: "Table number is required." })
    .int("Table number must be a whole number.")
    .positive("Table number must be greater than zero."),
  isActive: z.boolean(),
});

export type CreateTableFormValues = z.infer<typeof createTableSchema>;
