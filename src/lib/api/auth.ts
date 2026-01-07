/**
 * Authentication API functions
 */

import { apiClient } from "./client";
import {
  setAccessToken,
  setUserProfile,
  clearAllStorage,
} from "../utils/storage";
import type { LoginDto, RegisterDto, User } from "../types";

type AuthResponse = {
  token: string;
  user: User;
};

/**
 * Login user
 */
export const login = async (dto: LoginDto): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/login", dto);
  const { token, user } = res.data;

  await setAccessToken(token);
  await setUserProfile(user);

  return { token, user };
};

/**
 * Register user
 */
export const register = async (dto: RegisterDto): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/register", dto);
  const { token, user } = res.data;

  await setAccessToken(token);
  await setUserProfile(user);

  return { token, user };
};

/**
 * Logout (clear local tokens)
 */
export const logout = async (): Promise<void> => {
  await clearAllStorage();
};
