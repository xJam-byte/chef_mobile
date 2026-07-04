// src/lib/hooks/useVideos.ts
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getVideoFeed,
  getVideosByAuthor,
  likeVideo,
  unlikeVideo,
  recordVideoView,
  createVideoUploadUrl,
  uploadVideoToR2,
  confirmVideoUpload,
  type VideoFeedItem,
} from "../api/videos";

export function useVideoFeed(mode: "forYou" | "following" = "forYou") {
  return useInfiniteQuery({
    queryKey: ["video-feed", mode],
    queryFn: ({ pageParam }) =>
      getVideoFeed({ cursor: pageParam, limit: 10, mode }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

export function useVideosByAuthor(authorId: number | undefined) {
  return useInfiniteQuery({
    queryKey: ["videos-by-author", authorId],
    queryFn: ({ pageParam }) =>
      getVideosByAuthor({
        authorId: authorId!,
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!authorId,
  });
}

export function useLikeVideo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: likeVideo,
    onMutate: async (videoId) => {
      // Optimistic update - cancel all video-feed queries (matches ["video-feed", "forYou"] and ["video-feed", "following"])
      await qc.cancelQueries({ queryKey: ["video-feed"] });

      // Get all cached video feed data
      const queryCache = qc.getQueryCache();
      const queries = queryCache.findAll({ queryKey: ["video-feed"] });

      const previousDataMap: Map<string, any> = new Map();

      queries.forEach((query) => {
        const key = JSON.stringify(query.queryKey);
        const data = qc.getQueryData(query.queryKey);
        previousDataMap.set(key, data);

        qc.setQueryData(query.queryKey, (old: any) => {
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
                  : video,
              ),
            })),
          };
        });
      });

      return { previousDataMap };
    },
    onError: (err, videoId, context) => {
      // Rollback on error
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, key) => {
          qc.setQueryData(JSON.parse(key), data);
        });
      }
    },
    onSuccess: () => {
      // Invalidate to sync with server
      qc.invalidateQueries({ queryKey: ["video-feed"] });
    },
  });
}

export function useUnlikeVideo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: unlikeVideo,
    onMutate: async (videoId) => {
      // Optimistic update - cancel all video-feed queries
      await qc.cancelQueries({ queryKey: ["video-feed"] });

      // Get all cached video feed data
      const queryCache = qc.getQueryCache();
      const queries = queryCache.findAll({ queryKey: ["video-feed"] });

      const previousDataMap: Map<string, any> = new Map();

      queries.forEach((query) => {
        const key = JSON.stringify(query.queryKey);
        const data = qc.getQueryData(query.queryKey);
        previousDataMap.set(key, data);

        qc.setQueryData(query.queryKey, (old: any) => {
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
                      stats: {
                        ...video.stats,
                        likes: Math.max(0, video.stats.likes - 1),
                      },
                    }
                  : video,
              ),
            })),
          };
        });
      });

      return { previousDataMap };
    },
    onError: (err, videoId, context) => {
      // Rollback on error
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, key) => {
          qc.setQueryData(JSON.parse(key), data);
        });
      }
    },
    onSuccess: () => {
      // Invalidate to sync with server
      qc.invalidateQueries({ queryKey: ["video-feed"] });
    },
  });
}

export function useRecordView() {
  return useMutation({
    mutationFn: ({
      videoId,
      watchedMs,
      completed,
    }: {
      videoId: string;
      watchedMs: number;
      completed?: boolean;
    }) => recordVideoView(videoId, watchedMs, completed),
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
      // 1. Fetch video file from local URI to get the Blob and correct type
      const response = await fetch(params.videoUri);
      const blob = await response.blob();

      // infer type from blob or fallback
      const contentType = blob.type || "video/mp4";

      // 2. Get presigned URL with the ACTUAL content type
      const { uploadUrl, publicUrl } = await createVideoUploadUrl(contentType);

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
