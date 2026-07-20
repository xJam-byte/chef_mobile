import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getChefSchedule,
  getOrderDelivery,
  setMySchedule,
  type ScheduleDay,
} from "../api/schedule";
import { QUERY_KEYS } from "../constants";

export const useChefSchedule = (chefId?: number) =>
  useQuery({
    queryKey: QUERY_KEYS.CHEF_SCHEDULE(chefId),
    queryFn: () => getChefSchedule(chefId!),
    enabled: !!chefId,
  });

export const useSetMySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (days: ScheduleDay[]) => setMySchedule(days),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHEF_SCHEDULE(data.chefId),
      });
    },
  });
};

export const useOrderDelivery = (orderId?: number) =>
  useQuery({
    queryKey: QUERY_KEYS.ORDER_DELIVERY(orderId),
    queryFn: () => getOrderDelivery(orderId!),
    enabled: !!orderId,
    refetchInterval: 30_000,
  });
