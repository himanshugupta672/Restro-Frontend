import type { ApiErrorDetails } from "./api.types";

interface ApiErrorOptions {
  code?: string | undefined;
  details?: ApiErrorDetails | undefined;
  isCanceled?: boolean;
  status?: number | undefined;
}

export class ApiError extends Error {
  readonly code: string | undefined;
  readonly details: ApiErrorDetails | undefined;
  readonly isCanceled: boolean;
  readonly status: number | undefined;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.details = options.details;
    this.isCanceled = options.isCanceled ?? false;
    this.status = options.status;
  }
}
