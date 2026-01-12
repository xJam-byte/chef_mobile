/**
 * User profile React Query hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateContacts, uploadAvatar, updateEmail, updatePassword } from "../api/user";
import { getUserProfile, setUserProfile } from "../utils/storage";
import { QUERY_KEYS } from "../constants";
import type { User, UpdateContactsDto, UploadAvatarDto, UpdateEmailDto, UpdatePasswordDto } from "../types";

/**
 * Get current user profile from the same query cache as useAuthStatus
 * This ensures we always have the latest data including chef information
 */
export const useProfile = () => {
    return useQuery<User | null>({
        queryKey: ["profile"], // Same key as useAuthStatus
        queryFn: () => null as User | null, // Required by React Query, but won't be called
        enabled: false, // Don't refetch, just read from cache
        staleTime: Infinity, // Always use cached data
        gcTime: Infinity,
    });
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
            queryClient.setQueryData(["profile"], user);
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
