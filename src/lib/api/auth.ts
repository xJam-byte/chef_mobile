// src/lib/api/auth.ts
import { apiClient } from "./client";
import type { LoginEmailDto, RegisterDto, User } from "../types";

export type AuthResponse = { token: string; user: User };

export const loginEmail = async (data: LoginEmailDto): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/login-email", data);
  return res.data;
};

/** Шаг 1 входа по почте: проверяет email+пароль, шлёт код на почту */
export const sendEmailCode = async (data: LoginEmailDto): Promise<{ message: string }> => {
  const res = await apiClient.post("/auth/email/send-code", data);
  return res.data;
};

/** Шаг 2 входа по почте: код из письма → токен */
export const verifyEmail = async (data: { email: string; code: string }): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/email/verify", data);
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

/** Смена пароля, шаг 1: SMS-код на свой номер (нужна авторизация) */
export const sendPasswordCode = async (): Promise<{ message: string; phone_number: string }> => {
  const res = await apiClient.post("/auth/password/send-code");
  return res.data;
};

/** Смена пароля, шаг 2: код + новый пароль */
export const changePasswordWithCode = async (data: {
  code: string;
  new_password: string;
}): Promise<{ ok: boolean }> => {
  const res = await apiClient.post("/auth/password/change", data);
  return res.data;
};

/** Смена почты, шаг 1: код на НОВУЮ почту */
export const sendEmailChangeCode = async (newEmail: string): Promise<{ message: string }> => {
  const res = await apiClient.post("/auth/email-change/send-code", { newEmail });
  return res.data;
};

/** Смена почты, шаг 2: код → почта сохранена */
export const confirmEmailChange = async (data: {
  newEmail: string;
  code: string;
}): Promise<{ user_id: number; email: string }> => {
  const res = await apiClient.post("/auth/email-change/confirm", data);
  return res.data;
};

export const me = async (): Promise<User> => {
  const res = await apiClient.get<User>("/auth/me");
  return res.data;
};

/** Refresh the access token using the current (still valid) token */
export const refreshToken = async (): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/refresh");
  return res.data;
};
