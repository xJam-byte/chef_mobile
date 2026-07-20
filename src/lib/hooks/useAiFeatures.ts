import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCertificationUploadUrl,
  requestNutrition,
  submitCertification,
} from "../api/aiFeatures";
import { QUERY_KEYS } from "../constants";

export const useRequestNutrition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dishId: number) => requestNutrition(dishId),
    onSuccess: (_data, dishId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISH(dishId) });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
};

export const useSubmitCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photos: { uri: string; mimeType: string }[]) => {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const { uploadUrl, publicUrl } = await getCertificationUploadUrl(
          photo.mimeType
        );
        const blob = await (await fetch(photo.uri)).blob();
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": photo.mimeType },
          body: blob,
        });
        if (publicUrl) photoUrls.push(publicUrl);
      }
      return submitCertification(photoUrls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["chefs"] });
    },
  });
};
