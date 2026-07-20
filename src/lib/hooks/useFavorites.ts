import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite,
} from "../api/favorites";
import { QUERY_KEYS } from "../constants";

export const useFavorites = () =>
  useQuery({
    queryKey: QUERY_KEYS.FAVORITES(),
    queryFn: getFavorites,
  });

export const useIsFavorite = (dishId?: number) =>
  useQuery({
    queryKey: QUERY_KEYS.IS_FAVORITE(dishId),
    queryFn: () => isFavorite(dishId!),
    enabled: !!dishId,
  });

/** Тоггл избранного с оптимистичным обновлением сердечка. */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dishId,
      isFavorite,
    }: {
      dishId: number;
      isFavorite: boolean;
    }) => (isFavorite ? removeFavorite(dishId) : addFavorite(dishId)),
    onMutate: async ({ dishId, isFavorite }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.IS_FAVORITE(dishId),
      });
      const previous = queryClient.getQueryData(QUERY_KEYS.IS_FAVORITE(dishId));
      queryClient.setQueryData(QUERY_KEYS.IS_FAVORITE(dishId), !isFavorite);
      return { previous, dishId };
    },
    onError: (_err, { dishId }, context) => {
      queryClient.setQueryData(
        QUERY_KEYS.IS_FAVORITE(dishId),
        context?.previous,
      );
    },
    onSettled: (_data, _err, { dishId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.IS_FAVORITE(dishId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAVORITES() });
    },
  });
};
