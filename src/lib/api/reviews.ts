/**
 * Reviews API functions
 */

import { apiClient } from "./client";
import type { Review, CreateReviewDto } from "../types";

/**
 * Create a new review
 */
export const createReview = async (data: CreateReviewDto): Promise<Review> => {
    const response = await apiClient.post<Review>("/reviews", data);
    return response.data;
};

/**
 * Get reviews for a chef
 */
export const getChefReviews = async (chefId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/reviews/chef/${chefId}`);
    return response.data;
};

/**
 * Get reviews for a dish
 */
export const getDishReviews = async (dishId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/reviews/dish/${dishId}`);
    return response.data;
};
