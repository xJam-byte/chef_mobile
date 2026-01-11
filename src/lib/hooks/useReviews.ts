/**
 * Reviews React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, getChefReviews } from "../api";
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
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.REVIEWS(review.chefId),
            });
            // Also invalidate chef data to refresh rating
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.CHEF(review.chefId),
            });
        },
    });
};
