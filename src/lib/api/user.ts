/**
 * User profile API functions
 */

import { apiClient } from "./client";
import type {
    User,
    UpdateContactsDto,
    UpdateEmailDto,
    UpdatePasswordDto,
    UploadAvatarDto,
} from "../types";

/**
 * Update user contacts (name, phone)
 */
export const updateContacts = async (data: UpdateContactsDto): Promise<User> => {
    const response = await apiClient.post<User>(
        "/user-customer/update/contacts",
        data
    );
    return response.data;
};

/**
 * Upload user avatar
 */
export const uploadAvatar = async (
    data: UploadAvatarDto
): Promise<{ user_id: number; profile_pic: string }> => {
    const response = await apiClient.post("/user-customer/avatar", data);
    return response.data;
};

/**
 * Update user email
 */
export const updateEmail = async (data: UpdateEmailDto): Promise<User> => {
    const response = await apiClient.post<User>(
        "/user-customer/update/email",
        data
    );
    return response.data;
};

/**
 * Update user password
 */
export const updatePassword = async (data: UpdatePasswordDto): Promise<User> => {
    const response = await apiClient.post<User>(
        "/user-customer/update/password",
        data
    );
    return response.data;
};
