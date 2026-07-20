import { apiClient } from "./client";

export interface ScheduleDay {
  schedule_id?: number;
  day_of_week: number; // 0=вс ... 6=сб
  open_time?: string | null;
  close_time?: string | null;
  is_day_off?: boolean;
}

export interface ChefSchedule {
  chefId: number;
  schedule: ScheduleDay[];
  is_open_now: boolean;
}

export const getChefSchedule = async (
  chefId: number
): Promise<ChefSchedule> => {
  const response = await apiClient.get<ChefSchedule>(
    `/chef/${chefId}/schedule`
  );
  return response.data;
};

export const setMySchedule = async (
  days: ScheduleDay[]
): Promise<ChefSchedule> => {
  const response = await apiClient.put<ChefSchedule>("/chef/me/schedule", {
    days,
  });
  return response.data;
};

export interface DeliveryQuote {
  fee: number;
  etaMinutes: number;
  provider: string;
}

export const getDeliveryQuote = async (
  addressId: number,
  chefId: number
): Promise<DeliveryQuote> => {
  const response = await apiClient.post<DeliveryQuote>("/v1/delivery/quote", {
    addressId,
    chefId,
  });
  return response.data;
};

export interface OrderDeliveryStatus {
  provider?: string | null;
  status?: string | null;
  fee?: string | number | null;
  trackingUrl?: string | null;
}

export const getOrderDelivery = async (
  orderId: number
): Promise<OrderDeliveryStatus> => {
  const response = await apiClient.get<OrderDeliveryStatus>(
    `/v1/orders/${orderId}/delivery`
  );
  return response.data;
};
