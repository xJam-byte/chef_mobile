import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/orders";
import { QUERY_KEYS } from "../constants";
import type { CreateOrderDto } from "../types";

/* =========================
   GET ORDERS
========================= */

/**
 * Get current user's order history (uses JWT token)
 */
export function useOrders() {
  return useQuery({
    queryKey: ["orders", "my", "history"],
    queryFn: () => orderApi.getOrderHistory(),
  });
}

/**
 * Get current chef's orders (uses JWT token)
 */
export function useChefOrders() {
  return useQuery({
    queryKey: ["orders", "my", "chef"],
    queryFn: () => orderApi.getChefOrders(),
  });
}

/* =========================
   CREATE ORDER
========================= */

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * @deprecated Use useOrders() instead - now uses JWT token automatically
 */
export function useOrderHistory(userId: number | undefined) {
  return useQuery({
    queryKey: ["orders", "my", "history"],
    queryFn: () => orderApi.getOrderHistory(),
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
    },
  });
}
