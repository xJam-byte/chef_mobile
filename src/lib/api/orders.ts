/**
 * Orders API functions
 */

import { apiClient } from "./client";
import type { Order, CreateOrderDto } from "../types";

export const orderApi = {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await apiClient.post<Order>("/order", data);
    return response.data;
  },

  /**
   * Get current user's order history (uses JWT token)
   */
  async getOrderHistory(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>("/order/my/history");
    return response.data;
  },

  /**
   * Get single order by ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/order/${orderId}`);
    return response.data;
  },

  /**
   * Get current chef's orders (uses JWT token)
   */
  async getChefOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>("/order/my/chef");
    return response.data;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/order/${orderId}/status`, {
      status,
    });
    return response.data;
  },
};
