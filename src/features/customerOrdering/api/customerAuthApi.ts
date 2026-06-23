import { publicApiClient, API_ENDPOINTS } from "@/services/api";

export interface SendOtpPayload {
  email?: string;
  phoneNumber?: string;
}

export interface VerifyOtpPayload {
  email?: string;
  phoneNumber?: string;
  otp: string;
}

export interface CustomerRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export const sendOtpCode = async (payload: SendOtpPayload) => {
  const response = await publicApiClient.post<{ message: string; otp?: string }>(
    `${API_ENDPOINTS.auth.login.replace("/login", "")}/otp/send`,
    payload
  );
  return response.data;
};

export const verifyOtpCode = async (payload: VerifyOtpPayload) => {
  const response = await publicApiClient.post<{
    accessToken: string;
    token: string;
    role: string;
    userId: number;
  }>(
    `${API_ENDPOINTS.auth.login.replace("/login", "")}/otp/verify`,
    payload
  );
  return response.data;
};

export const registerCustomerAccount = async (payload: CustomerRegisterPayload) => {
  const response = await publicApiClient.post<{
    accessToken: string;
    token: string;
    role: string;
    userId: number;
  }>(
    `${API_ENDPOINTS.auth.login.replace("/login", "")}/customer/register`,
    payload
  );
  return response.data;
};
