import axios from "axios";

import { ApiError } from "./ApiError";
import type { ValidationProblemDetails } from "./api.types";

const isProblemDetails = (
  value: unknown
): value is ValidationProblemDetails => {
  return typeof value === "object" && value !== null;
};

const getResponseMessage = (payload: unknown, status?: number) => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (isProblemDetails(payload)) {
    if (payload.title?.trim()) {
      return payload.title;
    }
  }

  if (status === 401) {
    return "Your session is not authorized.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource was not found.";
  }

  if (status && status >= 500) {
    return "The server could not complete the request.";
  }

  return "The request could not be completed.";
};

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isCancel(error)) {
    return new ApiError("The request was canceled.", {
      code: "REQUEST_CANCELED",
      isCanceled: true,
    });
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload: unknown = error.response?.data;
    const problemDetails = isProblemDetails(payload) ? payload : undefined;
    const details = {
      payload,
      ...(problemDetails?.errors ? { fieldErrors: problemDetails.errors } : {}),
      ...(problemDetails?.traceId ? { traceId: problemDetails.traceId } : {}),
    };

    if (error.code === "ECONNABORTED") {
      return new ApiError("The request timed out. Please try again.", {
        code: error.code,
        details,
        status,
      });
    }

    if (!error.response) {
      return new ApiError("Unable to connect to the server.", {
        code: error.code,
        details,
      });
    }

    return new ApiError(getResponseMessage(payload, status), {
      code: error.code,
      details,
      status,
    });
  }

  if (error instanceof Error) {
    return new ApiError(error.message, {
      code: "UNEXPECTED_ERROR",
    });
  }

  return new ApiError("An unexpected error occurred.", {
    code: "UNEXPECTED_ERROR",
    details: {
      payload: error,
    },
  });
};
