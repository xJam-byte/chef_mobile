/**
 * Reviews React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, getChefReviews, getDishReviews } from "../api";
import { QUERY_KEYS } from "../constants";
import type { CreateReviewDto } from "../types";

/**
 * Get reviews for a chef
 */
export const useChefReviews = (chefId: number) => {
    return useQuery({
        queryKey: QUERY_KEYS.REVIEWS(chefId),
        queryFn: () => getChefReviews(chefId),
        enabled: !!chefId,
    });
};

/**
 * Create a new review mutation
 */
export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReviewDto) => createReview(data),
        onSuccess: (review) => {
            if (review.chefId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.REVIEWS(review.chefId),
                });
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.CHEF(review.chefId),
                });
            }
            if (review.dishId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.DISH_REVIEWS(review.dishId),
                });
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.DISH(review.dishId),
                });
            }
        },
    });
};

/**
 * Get reviews for a dish
 */
export const useDishReviews = (dishId: number) => {
    return useQuery({
        queryKey: QUERY_KEYS.DISH_REVIEWS(dishId),
        queryFn: () => getDishReviews(dishId),
        enabled: !!dishId,
    });
};