import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type {
  FollowStatsResponse,
  IsFollowingResponse,
  FollowsResponse,
} from '../types';

/**
 * Hook to follow/unfollow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiClient.post(`/follows/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      // console.log('✅ Follow successful');
      // Invalidate relevant queries
      // NOTE: Don't invalidate 'profile' - it doesn't change when following someone
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['chef'] });
    },
    onError: (error: any) => {
      // Don't invalidate profile on auth errors to prevent redirect to login
      console.error('Follow error:', error?.response?.status, error?.message);
      
      // Only invalidate non-auth related queries
      if (error?.response?.status !== 401) {
        queryClient.invalidateQueries({ queryKey: ['followStats'] });
        queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      }
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiClient.delete(`/follows/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      console.log('✅ Unfollow successful');
      // Invalidate relevant queries
      // NOTE: Don't invalidate 'profile' - it doesn't change when unfollowing someone
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['chef'] });
    },
    onError: (error: any) => {
      // Don't invalidate profile on auth errors to prevent redirect to login
      console.error('Unfollow error:', error?.response?.status, error?.message);
      
      // Only invalidate non-auth related queries
      if (error?.response?.status !== 401) {
        queryClient.invalidateQueries({ queryKey: ['followStats'] });
        queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      }
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
}

/**
 * Hook to get follower/following stats for a user
 */
export function useFollowStats(userId: number | undefined) {
  return useQuery<FollowStatsResponse>({
    queryKey: ['followStats', userId],
    queryFn: async () => {
      const res = await apiClient.get(`/follows/${userId}/stats`);
      return res.data;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to check if current user is following a target user
 */
export function useIsFollowing(userId: number | undefined) {
  return useQuery<IsFollowingResponse>({
    queryKey: ['isFollowing', userId],
    queryFn: async () => {
      const res = await apiClient.get(`/follows/check/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to get followers list
 */
export function useFollowers(userId: number | undefined) {
  return useQuery<FollowsResponse>({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const res = await apiClient.get(`/follows/${userId}/followers`);
      return res.data;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to get following list
 */
export function useFollowing(userId: number | undefined) {
  return useQuery<FollowsResponse>({
    queryKey: ['following', userId],
    queryFn: async () => {
      const res = await apiClient.get(`/follows/${userId}/following`);
      return res.data;
    },
    enabled: !!userId,
  });
}
