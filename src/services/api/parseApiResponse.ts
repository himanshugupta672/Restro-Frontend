import { z } from "zod";

import { ApiError } from "./ApiError";

export const parseApiResponse = <TSchema extends z.ZodType>(
  schema: TSchema,
  payload: unknown
): z.output<TSchema> => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error(
        "[parseApiResponse] Schema validation failed.",
        "\n→ Payload:",
        payload,
        "\n→ Issues:",
        result.error.issues
      );
    }

    throw new ApiError("The server returned an unexpected response.", {
      code: "INVALID_API_RESPONSE",
      details: {
        payload: String(result.error),
      },
    });
  }

  return result.data;
};
