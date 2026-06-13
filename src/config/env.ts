import { z } from "zod";

const environmentSchema = z.object({
  VITE_API_BASE_URL: z.url(),
});

const parsedEnvironment = environmentSchema.safeParse(import.meta.env);

if (!parsedEnvironment.success) {
  console.error(
    "Invalid environment configuration:",
    z.treeifyError(parsedEnvironment.error)
  );
  throw new Error("The application environment is not configured correctly.");
}

export const env = Object.freeze(parsedEnvironment.data);
