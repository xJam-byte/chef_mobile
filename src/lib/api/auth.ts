// src/lib/api/auth.ts
import { apiClient } from "./client";
import type { LoginDto, LoginEmailDto, RegisterDto, User } from "../types";

export type AuthResponse = { token: string; user: User };

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const loginEmail = async (data: LoginEmailDto): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/login-email", data);
  return res.data;
};

export const registration = async (data: RegisterDto): Promise<{ user: User }> => {
  const res = await apiClient.post<{ user: User }>("/auth/registration", data);
  return res.data;
};

export const sendSms = async (phone_number: string): Promise<{ message: string }> => {
  const res = await apiClient.post("/auth/send-sms", { phone_number });
  return res.data;
};

export const verifySms = async (data: { phone_number: string; code: string }): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/verify-sms", data);
  return res.data;
};

export const me = async (): Promise<User> => {
  const res = await apiClient.get<User>("/auth/me");
  return res.data;
};
