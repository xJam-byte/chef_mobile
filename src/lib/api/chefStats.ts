import { apiClient } from './client';

export interface ChefStats {
  monthlyEarnings: number;
  videoOrdersCount: number;
  topDishesThisWeek: TopDish[];
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface TopDish {
  dish_id: number;
  name: string;
  picture: string | null;
  ordersThisWeek: number;
  revenueThisWeek: number;
}

export const chefStatsApi = {
  getStatistics: async (chefId: number): Promise<ChefStats> => {
    const response = await apiClient.get(`/chef/${chefId}/statistics`);
    return response.data;
  },
};
