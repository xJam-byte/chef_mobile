// src/lib/api/safety.ts
import { apiClient } from "./client";

export const safetyApi = {
  report: async (data: {
    targetId: number;
    targetType: "user" | "video" | "dish";
    reason: string;
    details?: string;
  }) => {
    const res = await apiClient.post("/safety/report", data);
    return res.data;
  },

  blockUser: async (data: { blockedId: number }) => {
    const res = await apiClient.post("/safety/block", data);
    return res.data;
  },

  unblockUser: async (blockedId: number) => {
    const res = await apiClient.delete(`/safety/block/${blockedId}`);
    return res.data;
  },

  getBlockedUsers: async () => {
    const res = await apiClient.get("/safety/blocked");
    return res.data;
  },
};
