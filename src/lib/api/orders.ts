/**
 * Orders API functions
 */

import { apiClient } from "./client";
import type { Order, CreateOrderDto } from "../types";

/**
 * Create a new order
 */
export const createOrder = async (data: CreateOrderDto): Promise<Order> => {
  // Исправлено: /order -> /orders
  const response = await apiClient.post<Order>("/orders", data);
  return response.data;
};

/**
 * Get user's order history
 */
export const getOrderHistory = async (userId: number): Promise<Order[]> => {
  // Исправлено: /order/... -> /orders/user/...
  const response = await apiClient.get<Order[]>(`/orders/user/${userId}`);
  return response.data;
};
