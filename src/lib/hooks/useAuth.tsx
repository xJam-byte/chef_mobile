// src/lib/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../api/client";
import { login, registration, me } from "../api/auth";
import type { LoginDto, RegisterDto, User } from "../types";

const TOKEN_KEY = "auth_token";

async function ensureAuthHeader() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  else delete apiClient.defaults.headers.Authorization;
  return token;
}

export function useAuthStatus() {
  return useQuery<User | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        await ensureAuthHeader();
        return await me();
      } catch (error: any) {
        // Only return null if it's a 401 (unauthenticated) error
        if (error?.response?.status === 401) {
          return null;
        }
        // For network errors or other issues, throw to trigger retry
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (auth error)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - increase from 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginDto) => {
      const data = await login(payload); // { token, user }
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
      return data;
    },
    onSuccess: async (data) => {
      qc.setQueryData(["profile"], data.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterDto) => {
      const data = await registration(payload); // { token, user }
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);

      apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
      return data;
    },
    onSuccess: async (data) => {
      // 🔥 Моментальный редирект
      qc.setQueryData(["profile"], data.user);
      await qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      delete apiClient.defaults.headers.Authorization;
    },
    onSuccess: () => {
      qc.setQueryData(["profile"], null);
    },
  });
}
