// src/lib/hooks/useVideos.ts
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVideoFeed,
  likeVideo,
  unlikeVideo,
  recordVideoView,
  createVideoUploadUrl,
  uploadVideoToR2,
  confirmVideoUpload,
  type VideoFeedItem,
} from "../api/videos";

export function useVideoFeed() {
  return useInfiniteQuery({
    queryKey: ["video-feed"],
    queryFn: ({ pageParam }) => getVideoFeed({ cursor: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

export function useLikeVideo() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: likeVideo,
    onMutate: async (videoId) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ["video-feed"] });
      
      const previousData = qc.getQueryData(["video-feed"]);
      
      qc.setQueryData(["video-feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((video: VideoFeedItem) =>
              video.id === videoId
                ? {
                    ...video,
                    likedByMe: true,
                    stats: { ...video.stats, likes: video.stats.likes + 1 },
                  }
                : video
            ),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (err, videoId, context) => {
      // Rollback on error
      if (context?.previousData) {
        qc.setQueryData(["video-feed"], context.previousData);
      }
    },
  });
}

export function useUnlikeVideo() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: unlikeVideo,
    onMutate: async (videoId) => {
      await qc.cancelQueries({ queryKey: ["video-feed"] });
      
      const previousData = qc.getQueryData(["video-feed"]);
      
      qc.setQueryData(["video-feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((video: VideoFeedItem) =>
              video.id === videoId
                ? {
                    ...video,
                    likedByMe: false,
                    stats: { ...video.stats, likes: Math.max(0, video.stats.likes - 1) },
                  }
                : video
            ),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (err, videoId, context) => {
      if (context?.previousData) {
        qc.setQueryData(["video-feed"], context.previousData);
      }
    },
  });
}

export function useRecordView() {
  return useMutation({
    mutationFn: ({ videoId, watchedMs, completed }: { videoId: string; watchedMs: number; completed?: boolean }) =>
      recordVideoView(videoId, watchedMs, completed),
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      videoUri: string;
      description?: string;
      dishId?: number;
    }) => {
      // 1. Get presigned URL
      const { uploadUrl, publicUrl } = await createVideoUploadUrl("video/mp4");

      // 2. Fetch video file from local URI
      const response = await fetch(params.videoUri);
      const blob = await response.blob();

      // 3. Upload to R2
      await uploadVideoToR2(uploadUrl, blob);

      // 4. Confirm upload and create database record
      const result = await confirmVideoUpload({
        videoUrl: publicUrl,
        description: params.description,
        dishId: params.dishId,
      });

      return result;
    },
    onSuccess: () => {
      // Invalidate video feed to show new video
      qc.invalidateQueries({ queryKey: ["video-feed"] });
    },
  });
}
