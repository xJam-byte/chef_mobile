// src/lib/hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyAddresses, createAddress, type CreateAddressDto } from "../api/addresses";
import { QUERY_KEYS } from "../constants";

export function useMyAddresses(userId?: number) {
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getMyAddresses(userId!),
    enabled: !!userId,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["addresses", variables.userId] });
    },
  });
}
