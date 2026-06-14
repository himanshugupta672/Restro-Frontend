import { z } from "zod";

export const categorySchema = z.object({
  displayOrder: z.coerce.number().int().min(0),
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1),
});

export const categoriesSchema = z.array(categorySchema);

export const menuItemSchema = z.object({
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
});

export const menuItemsSchema = z.array(menuItemSchema);

export const categoryFormSchema = z.object({
  displayOrder: z
    .number({ error: "Display order is required." })
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative."),
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(80, "Category name cannot exceed 80 characters."),
});

export const menuItemFormSchema = z.object({
  categoryId: z
    .number({ error: "Select a category." })
    .int()
    .positive("Select a category."),
  description: z
    .string()
    .trim()
    .min(3, "Description must contain at least 3 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.url().safeParse(value).success,
      "Enter a valid image URL."
    ),
  isAvailable: z.boolean(),
  name: z
    .string()
    .trim()
    .min(2, "Item name must contain at least 2 characters.")
    .max(120, "Item name cannot exceed 120 characters."),
  prepTimeMinutes: z
    .number({ error: "Preparation time is required." })
    .int("Preparation time must be a whole number.")
    .min(0, "Preparation time cannot be negative.")
    .max(1440, "Preparation time cannot exceed 1440 minutes."),
  price: z
    .number({ error: "Price is required." })
    .positive("Price must be greater than zero.")
    .max(1_000_000, "Price is too large."),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;
