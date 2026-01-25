import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/orders";
import { QUERY_KEYS } from "../constants";
import type { CreateOrderDto } from "../types";

/* =========================
   GET ORDERS
========================= */

export function useOrders(userId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS({userId}),
    enabled: !!userId && userId > 0,
    queryFn: () => orderApi.getOrderHistory(userId!), // Changed to use orderApi
  });
}

export function useChefOrders(userId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.CHEF_ORDERS(userId),
    enabled: !!userId && userId > 0,
    queryFn: () => orderApi.getChefOrders(userId!),
  });
}

/* =========================
   CREATE ORDER
========================= */

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.createOrder, // Changed to use orderApi
    onSuccess: (data, variables) => {
      // console.log("[useCreateOrder] Order created successfully, invalidating caches");
      
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      // Also invalidate user-specific order history
      if (variables.userId) {
        queryClient.invalidateQueries({ 
          queryKey: ["orders", "history", variables.userId] 
        });
      }
      
      // console.log("[useCreateOrder] Cache invalidation complete");
    },
  });
}

/**
 * Fetch order history for a user
 */
export function useOrderHistory(userId: number | undefined) {
  return useQuery({
    queryKey: ["orders", "history", userId],
    queryFn: () => orderApi.getOrderHistory(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch a single order details
 */
export function useOrder(orderId: number) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId && orderId > 0,
  });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderApi.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      // Invalidate specific order and all order lists
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["chef-orders"] });
    },
  });
}
