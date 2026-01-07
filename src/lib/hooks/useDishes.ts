import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../constants";
import {
  getAllDishes,
  getDishById,
  getDishesByChef,
  createDish,
} from "../api/dishes";
import type { CreateDishDto } from "../types";

/* =========================
   TYPES
========================= */

type UseDishesParams = {
  page?: number;
  limit?: number;
  chefId?: number;
  search?: string;
};

/* =========================
   GET ALL DISHES
========================= */

export function useDishes(params?: UseDishesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.DISHES(params || {}),
    queryFn: () => {
      if (params?.chefId) {
        return getDishesByChef(params.chefId, params);
      }
      return getAllDishes(params);
    },
    placeholderData: (previousData) => previousData,
  });
}

/* =========================
   GET SINGLE DISH
========================= */

export function useDish(dishId: number) {
  return useQuery({
    queryKey: ["dish", dishId],
    queryFn: () => getDishById(dishId),
    enabled: !!dishId,
    staleTime: 1000 * 60 * 5, // 5 минут кэша
  });
}

/* =========================
   GET CHEF DISHES
========================= */

export function useChefDishes(chefId?: number) {
  return useQuery({
    queryKey: ["chef-dishes", chefId],
    enabled: !!chefId,
    queryFn: () => getDishesByChef(chefId!),
  });
}

/* =========================
   CREATE DISH
========================= */

export function useCreateDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDishDto) => createDish(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] as any });
    },
  });
}
