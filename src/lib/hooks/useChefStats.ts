import { useQuery } from '@tanstack/react-query';
import { chefStatsApi } from '../api/chefStats';

export const useChefStats = (chefId: number | undefined) => {
  return useQuery({
    queryKey: ['chefStats', chefId],
    queryFn: () => chefStatsApi.getStatistics(chefId!),
    enabled: !!chefId && chefId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
