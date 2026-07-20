import { apiClient } from "./client";

export interface ReferralInfo {
  code: string;
  share_link: string;
  bonus_per_friend: number;
  total_earned: number;
  invited: {
    name: string;
    status: "pending" | "completed";
    invitedAt: string;
    completedAt?: string | null;
  }[];
}

export const getMyReferralInfo = async (): Promise<ReferralInfo> => {
  const response = await apiClient.get<ReferralInfo>("/v1/referrals/me");
  return response.data;
};

export const redeemReferralCode = async (code: string) => {
  const response = await apiClient.post("/v1/referrals/redeem", { code });
  return response.data;
};

export interface BadgeItem {
  badge_id: number;
  type: "pioneer" | "taster" | "early_user";
  awardedAt: string;
  expiresAt?: string | null;
}

export interface MyBadges {
  badges: BadgeItem[];
  pioneer_progress: { current: number; required: number };
}

export const getMyBadges = async (): Promise<MyBadges> => {
  const response = await apiClient.get<MyBadges>("/v1/badges/me");
  return response.data;
};
