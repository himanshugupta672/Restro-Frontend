import { normalizeApiError } from "@/services/api";

import type { AppAsyncError } from "./async.types";

interface AppAsyncErrorOptions {
  notify?: boolean;
}

export const toAppAsyncError = (
  error: unknown,
  options: AppAsyncErrorOptions = {}
): AppAsyncError => {
  const apiError = normalizeApiError(error);

  return {
    message: apiError.message,
    notify: options.notify ?? !apiError.isCanceled,
    ...(apiError.code ? { code: apiError.code } : {}),
    ...(apiError.status !== undefined ? { status: apiError.status } : {}),
    ...(apiError.details?.fieldErrors
      ? { fieldErrors: apiError.details.fieldErrors }
      : {}),
    ...(apiError.details?.traceId ? { traceId: apiError.details.traceId } : {}),
  };
};

export const isAppAsyncError = (value: unknown): value is AppAsyncError => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<AppAsyncError>;

  return (
    typeof candidate.message === "string" &&
    typeof candidate.notify === "boolean"
  );
};
