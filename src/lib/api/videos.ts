// src/lib/api/videos.ts
import { apiClient } from "./client";

export interface VideoFeedItem {
  id: string;
  url: string;
  posterUrl?: string;
  description?: string;
  durationMs?: number;
  width?: number;
  height?: number;
  tags?: any;
  createdAt: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  author: {
    id: number;
    name: string;
    avatar?: string;
    role: string;
  };
  dish?: {
    id: number;
    name: string;
    price: number;
    picture?: string;
    description?: string;
  } | null;
  likedByMe: boolean;
}

export interface VideoFeedResponse {
  items: VideoFeedItem[];
  nextCursor: string | null;
}

export const getVideoFeed = async (params?: {
  limit?: number;
  cursor?: string;
  mode?: "forYou" | "following";
}): Promise<VideoFeedResponse> => {
  const res = await apiClient.get<VideoFeedResponse>("/v1/videos/feed", {
    params,
  });
  return res.data;
};

export const getVideosByAuthor = async (params: {
  authorId: number;
  limit?: number;
  cursor?: string;
}): Promise<VideoFeedResponse> => {
  const res = await apiClient.get<VideoFeedResponse>(`/v1/videos/author/${params.authorId}`, {
    params: { limit: params.limit, cursor: params.cursor },
  });
  return res.data;
};

export const likeVideo = async (videoId: string) => {
  const res = await apiClient.post(`/v1/videos/${videoId}/like`);
  return res.data;
};

export const unlikeVideo = async (videoId: string) => {
  const res = await apiClient.delete(`/v1/videos/${videoId}/like`);
  return res.data;
};

export const recordVideoView = async (
  videoId: string,
  watchedMs: number,
  completed?: boolean
) => {
  const res = await apiClient.post(`/v1/videos/${videoId}/view`, {
    watchedMs,
    completed,
  });
  return res.data;
};

export const createVideoUploadUrl = async (contentType: string) => {
  const res = await apiClient.post("/v1/videos/upload/url", { contentType });
  return res.data;
};

export const uploadVideoToR2 = async (presignedUrl: string, videoFile: any) => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: videoFile,
    headers: {
      "Content-Type": videoFile.type || "video/mp4",
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response;
};

export const confirmVideoUpload = async (data: {
  videoUrl: string;
  posterUrl?: string;
  description?: string;
  dishId?: number;
  durationMs?: number;
  width?: number;
  height?: number;
}) => {
  const res = await apiClient.post("/v1/videos/confirm", data);
  return res.data;
};
