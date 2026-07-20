import { apiClient } from "./client";
import type { Dish } from "../types";

export const requestNutrition = async (
  dishId: number
): Promise<{ nutrition: Dish["nutrition"] }> => {
  const response = await apiClient.post(`/v1/dishes/${dishId}/nutrition`);
  return response.data;
};

export const getCertificationUploadUrl = async (
  contentType: string
): Promise<{ key: string; uploadUrl: string; publicUrl?: string }> => {
  const response = await apiClient.post("/v1/chefs/certification/upload-url", {
    contentType,
  });
  return response.data;
};

export interface CertificationResult {
  approved: boolean;
  score: number;
  cleanliness: number;
  plating: number;
  verdict: string;
  photoUrls: string[];
  analyzedAt: string;
}

export const submitCertification = async (
  photoUrls: string[]
): Promise<CertificationResult> => {
  const response = await apiClient.post("/v1/chefs/certification/submit", {
    photoUrls,
  });
  return response.data;
};
