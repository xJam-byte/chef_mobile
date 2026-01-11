import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderHistory, createOrder } from "../api/orders";
import { QUERY_KEYS } from "../constants";
import type { CreateOrderDto } from "../types";

/* =========================
   GET ORDERS
========================= */

export function useOrders(userId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS({userId}),
    enabled: !!userId && userId > 0,
    queryFn: () => getOrderHistory(userId!),
  });
}

/* =========================
   CREATE ORDER
========================= */

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderDto) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] as any });
    },
  });
}
