/**
 * Chef API functions
 */

import { apiClient } from "./client";
import type {
  Chef,
  ChefsResponse,
  BecomeChefDto,
  PaginationParams,
} from "../types";

/**
 * Get all chefs with pagination
 */
export const getAllChefs = async (
  params: PaginationParams = {}
): Promise<ChefsResponse> => {
  const { page = 1, limit = 10 } = params;
  const response = await apiClient.get<ChefsResponse>(
    `/chef/getAll?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Get chef by user ID
 */
export const getChefByUserId = async (userId: number): Promise<Chef> => {
  const response = await apiClient.get<Chef>(`/chef/getChefByUserId/${userId}`);
  return response.data;
};

export const getChefById = async (chefId: number): Promise<Chef> => {
  const response = await apiClient.get<Chef>(`/chef/getChefById/${chefId}`);
  return response.data;
};

/**
 * Become a chef
 */
export const becomeChef = async (data: BecomeChefDto): Promise<Chef> => {
  const response = await apiClient.post<Chef>("/chef/become", data);
  return response.data;
};
