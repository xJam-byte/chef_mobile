/**
 * Dishes API functions
 */

import { apiClient } from "./client";
import type {
  Dish,
  DishesResponse,
  CreateDishDto,
  DishChefOffer,
  PaginationParams,
} from "../types";

/**
 * Get all dishes with pagination
 */
export const getAllDishes = async (
  params: PaginationParams = {}
): Promise<DishesResponse> => {
  const { page = 1, limit = 10, search, type, is_spicy, is_healthy, meal_time, sort } = params;
  
  // Use URLSearchParams for safe query string generation
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  if (search) queryParams.append('search', search);
  if (type) queryParams.append('type', type);
  if (is_spicy !== undefined) queryParams.append('is_spicy', is_spicy.toString());
  if (is_healthy !== undefined) queryParams.append('is_healthy', is_healthy.toString());
  if (meal_time) queryParams.append('meal_time', meal_time);
  if (sort) queryParams.append('sort', sort);

  const url = `/dishes?${queryParams.toString()}`;
  
  const response = await apiClient.get<DishesResponse>(url);
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
  const response = await apiClient.get<Dish>(`/dishes/getById/${dishId}`);
  return response.data;
};

export const getDishesByChefId = async (chefId: number): Promise<Dish> => {
  const response = await apiClient.get<Dish>(`/dishes/getByChef/${chefId}`);
  return response.data;
};

/**
 * Create a new dish (for chefs)
 */
export const createDish = async (data: CreateDishDto): Promise<Dish> => {
  const response = await apiClient.post<Dish>("/dishes", data);
  return response.data;
};

/**
 * Повара, готовящие блюдо (активные офферы): цена каждого + открыт ли сейчас
 */
export const getDishChefs = async (
  dishId: number,
): Promise<DishChefOffer[]> => {
  const response = await apiClient.get<DishChefOffer[]>(
    `/dishes/${dishId}/chefs`,
  );
  return response.data;
};

/** Шеф присоединяется к блюду со своей ценой (или обновляет её) */
export const upsertDishOffer = async (dishId: number, price: number) => {
  const response = await apiClient.put(`/dishes/${dishId}/offer`, { price });
  return response.data;
};

/** Шеф перестаёт готовить блюдо */
export const deleteDishOffer = async (dishId: number) => {
  const response = await apiClient.delete(`/dishes/${dishId}/offer`);
  return response.data;
};
