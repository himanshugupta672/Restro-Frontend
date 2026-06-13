import { z } from "zod";

import {
  apiClient,
  API_ENDPOINTS,
  parseApiResponse,
  publicApiClient,
} from "@/services/api";

import { USER_ROLES, type LoginCredentials } from "../types/auth.types";

const userRoleSchema = z.enum([
  USER_ROLES.admin,
  USER_ROLES.chef,
  USER_ROLES.customer,
]);

const tokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  role: userRoleSchema,
  userId: z.coerce.number().int().positive(),
});

const currentUserResponseSchema = z.object({
  email: z.email(),
  role: userRoleSchema,
  userId: z.coerce.number().int().positive(),
});

export const login = async (credentials: LoginCredentials) => {
  const response = await publicApiClient.post<unknown>(
    API_ENDPOINTS.auth.login,
    credentials,
    {
      skipAuthRefresh: true,
    }
  );

  return parseApiResponse(tokenResponseSchema, response.data);
};

export const refreshAccessToken = async (): Promise<string> => {
  const response = await publicApiClient.post<unknown>(
    API_ENDPOINTS.auth.refreshToken,
    undefined,
    {
      skipAuthRefresh: true,
    }
  );

  return parseApiResponse(tokenResponseSchema, response.data).accessToken;
};

export const getCurrentUser = async (accessToken: string) => {
  const response = await apiClient.get<unknown>(API_ENDPOINTS.auth.me, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    skipAuthRefresh: true,
  });

  const user = parseApiResponse(currentUserResponseSchema, response.data);

  return {
    email: user.email,
    id: user.userId,
    role: user.role,
  };
};

export const logout = async () => {
  await apiClient.post(API_ENDPOINTS.auth.logout, undefined, {
    skipAuthRefresh: true,
  });
};
