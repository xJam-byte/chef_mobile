// src/lib/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../api/client";
import {
  registration,
  me,
  sendSms,
  verifySms,
  loginEmail,
  sendEmailCode,
  verifyEmail,
  sendPasswordCode,
  changePasswordWithCode,
  sendEmailChangeCode,
  confirmEmailChange,
} from "../api/auth";
import {
  setUserProfile,
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from "../utils/storage";
import type { RegisterDto, User, LoginEmailDto } from "../types";

export function useAuthStatus() {
  return useQuery<User | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const token = await getAccessToken();
        // console.log('🔑 Auth Check - Token exists:', !!token);

        if (!token) return null; // No token locally = definitely not logged in

        const user = await me();

        // ✅ Save profile to storage so useProfile() can access it
        if (user) {
          await setUserProfile(user);
        }

        return user;
      } catch (error: any) {
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

export function useLoginEmail() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginEmailDto) => {
      const data = await loginEmail(payload);
      await setAccessToken(data.token);
      apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
      return data;
    },
    onSuccess: async (data) => {
      qc.setQueryData(["profile"], data.user);
      await qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useSendEmailCode() {
  return useMutation({
    mutationFn: async (payload: LoginEmailDto) => {
      return await sendEmailCode(payload);
    },
  });
}

export function useVerifyEmail() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; code: string }) => {
      const data = await verifyEmail(payload);
      await setAccessToken(data.token);
      apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
      return data;
    },
    onSuccess: async (data) => {
      qc.setQueryData(["profile"], data.user);
      await setUserProfile(data.user);
      await qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useSendPasswordCode() {
  return useMutation({ mutationFn: sendPasswordCode });
}

export function useChangePasswordWithCode() {
  return useMutation({
    mutationFn: (payload: { code: string; new_password: string }) =>
      changePasswordWithCode(payload),
  });
}

export function useSendEmailChangeCode() {
  return useMutation({
    mutationFn: (newEmail: string) => sendEmailChangeCode(newEmail),
  });
}

export function useConfirmEmailChange() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { newEmail: string; code: string }) =>
      confirmEmailChange(payload),
    onSuccess: (data) => {
      qc.setQueryData(["profile"], (old: any) =>
        old ? { ...old, email: data.email } : old,
      );
    },
  });
}

export function useRegister() {
  // const qc = useQueryClient(); // Removed as we don't set profile on register anymore

  return useMutation({
    mutationFn: async (payload: RegisterDto) => {
      const data = await registration(payload); // { user }
      // NOTE: We do NOT set access token here anymore.
      // User must verify SMS to get token.
      return data;
    },
    // onSuccess removed because we don't have token/profile ready yet
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await removeAccessToken();
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
      await setAccessToken(data.token);
      apiClient.defaults.headers.Authorization = `Bearer ${data.token}`;
      return data;
    },
    onSuccess: async (data) => {
      // Update cache immediately
      qc.setQueryData(["profile"], data.user);
      await setUserProfile(data.user);
      // Force refetch to ensure consistency
      await qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
