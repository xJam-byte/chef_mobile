import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllChefs, getChefById, becomeChef } from "../api/chef";
import type { BecomeChefDto } from "../types";

/* =========================
   GET ALL CHEFS
========================= */

type UseChefsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useChefs(params?: UseChefsParams) {
  return useQuery({
    queryKey: ["chefs", params],
    queryFn: () => getAllChefs(params),
    placeholderData: (previousData) => previousData,
  });
}

/* =========================
   GET SINGLE CHEF
========================= */

export function useChef(chefId?: number) {
  return useQuery({
    queryKey: ["chef", chefId],
    enabled: !!chefId,
    queryFn: () => getChefById(chefId!),
  });
}

/* =========================
   BECOME CHEF
========================= */

export function useBecomeChef() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BecomeChefDto) => becomeChef(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] as any });
      queryClient.invalidateQueries({ queryKey: ["chefs"] as any });
    },
  });
}
