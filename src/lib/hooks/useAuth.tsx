// src/lib/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../api/client";
import { login, registration, me, sendSms, verifySms } from "../api/auth";
import { setUserProfile, getAccessToken } from "../utils/storage";
import type { LoginDto, RegisterDto, User } from "../types";

const TOKEN_KEY = "auth_token";

export function useAuthStatus() {
  return useQuery<User | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const token = await getAccessToken();
        // console.log('🔑 Auth Check - Token exists:', !!token);
        
        if (!token) return null; // No token locally = definitely not logged in

        const user = await me();
        // console.log('👤 Auth Check - User fetched:', !!user, user?.user_id);
        
        // ✅ Save profile to storage so useProfile() can access it
        if (user) {
          await setUserProfile(user);
        }
        
        return user;
      } catch (error: any) {
        console.error('❌ Auth Check - Error:', error?.response?.status, error?.message);
        
        // Only return null if it's a 401 (unauthenticated) error
        if (error?.response?.status === 401) {
          // console.log('🚫 Auth Check - 401 Unauthorized, returning null');
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
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
      // Set the profile data immediately so it's available in RoleSelectionScreen
      qc.setQueryData(["profile"], data.user);
      // Save to storage
      await setUserProfile(data.user);
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

export function useSendSms() {
  return useMutation({
    mutationFn: async (payload: { phone_number: string }) => {
      return await sendSms(payload.phone_number);
    },
  });
}

export function useVerifySms() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { phone_number: string; code: string }) => {
      const data = await verifySms(payload);
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
      return data;
    },
    onSuccess: async (data) => {
      qc.setQueryData(["profile"], data.user);
      await setUserProfile(data.user);
    },
  });
}

