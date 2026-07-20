/**
 * User profile React Query hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateContacts, uploadAvatar, updateEmail, updatePassword, deleteMyAccount } from "../api/user";
import { apiClient } from "../api/client";
import { getUserProfile, setUserProfile, removeAccessToken } from "../utils/storage";
import { QUERY_KEYS } from "../constants";
import type { User, UpdateContactsDto, UploadAvatarDto, UpdateEmailDto, UpdatePasswordDto } from "../types";
import { useAuthStatus } from "./useAuth";

/**
 * Get current user profile from the same query cache as useAuthStatus
 * This ensures we always have the latest data including chef information
 */
export const useProfile = () => {
    return useAuthStatus();
};

/**
 * Update contacts mutation
 */
export const useUpdateContacts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateContactsDto) => updateContacts(data),
        onSuccess: (user) => {
            setUserProfile(user);
            // Ответ содержит только часть полей — мержим, чтобы не потерять chefs/_count
            queryClient.setQueryData(["profile"], (old: any) =>
                old ? { ...old, ...user } : user,
            );
        },
    });
};

/**
 * Upload avatar mutation
 */
export const useUploadAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UploadAvatarDto) => uploadAvatar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};

/**
 * Update email mutation
 */
export const useUpdateEmail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateEmailDto) => updateEmail(data),
        onSuccess: (user) => {
            setUserProfile(user);
            queryClient.setQueryData(["profile"], user);
        },
    });
};

/**
 * Update password mutation
 */
export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (data: UpdatePasswordDto) => updatePassword(data),
    });
};

/**
 * Удаление аккаунта: чистит токен и весь кэш — как полный выход
 */
export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteMyAccount(),
        onSuccess: async () => {
            await removeAccessToken();
            delete apiClient.defaults.headers.Authorization;
            queryClient.setQueryData(["profile"], null);
            queryClient.clear();
        },
    });
};
