import { z } from "zod";

export const userRoleEnumSchema = z.enum(["Admin", "Chef", "Customer"]);
export const userStatusEnumSchema = z.enum(["Available", "Busy", "Offline"]);

export const userResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleEnumSchema,
  status: userStatusEnumSchema,
  lastAssignedAt: z.string().nullable().optional(),
});

export const userListResponseSchema = z.array(userResponseSchema);

// Admin Creating User schema
export const adminCreateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Enter a valid email address."),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    role: z.coerce.number().int().min(0).max(2),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm the password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// Admin Editing User schema (Password is optional)
export const adminUpdateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Enter a valid email address."),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    role: z.coerce.number().int().min(0).max(2),
    password: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: "Password must be at least 6 characters.",
      }),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserFormValues = z.infer<typeof adminUpdateUserSchema>;
