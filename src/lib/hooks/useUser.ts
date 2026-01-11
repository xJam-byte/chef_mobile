/**
 * User profile React Query hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateContacts, uploadAvatar, updateEmail, updatePassword } from "../api/user";
import { getUserProfile, setUserProfile } from "../utils/storage";
import { QUERY_KEYS } from "../constants";
import type { User, UpdateContactsDto, UploadAvatarDto, UpdateEmailDto, UpdatePasswordDto } from "../types";

/**
 * Get current user profile from storage
 */
export const useProfile = () => {
    return useQuery<User | null>({
        queryKey: QUERY_KEYS.PROFILE(),
        queryFn: getUserProfile,
        staleTime: 60000, // 1 minute
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
            queryClient.setQueryData(QUERY_KEYS.PROFILE(), user);
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
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE() });
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
            queryClient.setQueryData(QUERY_KEYS.PROFILE(), user);
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
