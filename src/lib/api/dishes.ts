/**
 * Dishes API functions
 */

import { apiClient } from "./client";
import type {
  Dish,
  DishesResponse,
  CreateDishDto,
  PaginationParams,
} from "../types";

/**
 * Get all dishes with pagination
 */
export const getAllDishes = async (
  params: PaginationParams = {}
): Promise<DishesResponse> => {
  const { page = 1, limit = 10 } = params;
  const response = await apiClient.get<DishesResponse>(
    `/dishes?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Get dishes by chef ID
 */
export const getDishesByChef = async (
  chefId: number,
  params: PaginationParams = {}
): Promise<DishesResponse> => {
  const { page = 1, limit = 10 } = params;
  const response = await apiClient.get<DishesResponse>(
    `/dishes/getByChef/${chefId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * [NEW] Get single dish by ID
 */
export const getDishById = async (dishId: number): Promise<Dish> => {
  const response = await apiClient.get<Dish>(`/dishes/${dishId}`);
  return response.data;
};

/**
 * Create a new dish (for chefs)
 */
export const createDish = async (data: CreateDishDto): Promise<Dish> => {
  const response = await apiClient.post<Dish>("/dishes", data);
  return response.data;
};
