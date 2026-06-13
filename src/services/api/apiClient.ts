import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";

import { ApiError } from "./ApiError";
import type { ApiAuthAdapter } from "./api.types";
import { normalizeApiError } from "./normalizeApiError";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
  }
}

const clientConfig = {
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrfToken",
  xsrfHeaderName: "X-CSRF-TOKEN",
};

export const publicApiClient = axios.create(clientConfig);
export const apiClient = axios.create(clientConfig);

let authAdapter: ApiAuthAdapter | null = null;
let refreshPromise: Promise<string> | null = null;

export const configureApiAuth = (adapter: ApiAuthAdapter) => {
  authAdapter = adapter;
};

const setBearerToken = (
  config: InternalAxiosRequestConfig,
  accessToken: string
) => {
  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set("Authorization", `Bearer ${accessToken}`);
};

const shouldExpireSession = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 401 || error.response?.status === 403;
};

const refreshAccessToken = async () => {
  if (!authAdapter) {
    throw new Error("The API authentication adapter has not been configured.");
  }

  if (!refreshPromise) {
    refreshPromise = authAdapter
      .refreshAccessToken()
      .catch((error: unknown) => {
        if (shouldExpireSession(error)) {
          authAdapter?.onSessionExpired();
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config;
  }

  const accessToken = authAdapter?.getAccessToken();

  if (accessToken) {
    setBearerToken(config, accessToken);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config;

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      request.skipAuthRefresh
    ) {
      return Promise.reject(normalizeApiError(error));
    }

    request._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      setBearerToken(request, accessToken);

      return await apiClient(request);
    } catch (refreshError) {
      return Promise.reject(normalizeApiError(refreshError));
    }
  }
);

publicApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error))
);
