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
  // Исправлено: /chef/getAll -> /chefs
  const response = await apiClient.get<ChefsResponse>(
    `/chefs?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Get chef by user ID
 */
export const getChefById = async (userId: number): Promise<Chef> => {
  const response = await apiClient.get<Chef>(`/chefs/${userId}`);
  return response.data;
};

/**
 * Become a chef
 */
export const becomeChef = async (data: BecomeChefDto): Promise<Chef> => {
  // Исправлено: /chef/becomeChef -> /chefs/become
  const response = await apiClient.post<Chef>("/chefs/become", data);
  return response.data;
};
