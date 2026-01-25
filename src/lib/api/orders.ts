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
    // console.log("OOOOOO",data)
    const response = await apiClient.post<Order>("/order", data);
    // console.log("Response",response)
    return response.data;
  },

  /**
   * Get user's order history
   */
  async getOrderHistory(userId: number): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(`/order/${userId}/history`);
    
    return response.data;
  },

  /**
   * Get single order by ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/order/${orderId}`);
    return response.data;
  },

  async getChefOrders(userId: number): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(`/order/${userId}/chef`);
    return response.data;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/order/${orderId}/status`, { status });
    return response.data;
  },
};
