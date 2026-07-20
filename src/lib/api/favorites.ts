import { apiClient } from "./client";
import type { Dish } from "../types";

export interface FavoriteDish extends Dish {
  favorited_at: string;
  chef_name: string | null;
  chef_avatar: string | null;
}

export const getFavorites = async (): Promise<FavoriteDish[]> => {
  const response = await apiClient.get<FavoriteDish[]>("/favorites");
  return response.data;
};

export const isFavorite = async (dishId: number): Promise<boolean> => {
  const response = await apiClient.get<{ is_favorite: boolean }>(
    `/favorites/check/${dishId}`,
  );
  return response.data.is_favorite;
};

export const addFavorite = async (dishId: number) => {
  const response = await apiClient.post(`/favorites/${dishId}`);
  return response.data;
};

export const removeFavorite = async (dishId: number) => {
  const response = await apiClient.delete(`/favorites/${dishId}`);
  return response.data;
};
