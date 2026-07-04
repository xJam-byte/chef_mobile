import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { safetyApi } from "../api/safety";
import { showMessage } from "react-native-flash-message";

export const useReport = () => {
  return useMutation({
    mutationFn: safetyApi.report,
    onSuccess: () => {
      showMessage({
        message: "Report submitted",
        description: "Thank you for helping keep our community safe.",
        type: "success",
      });
    },
    onError: () => {
      showMessage({
        message: "Error",
        description: "Could not submit report. Please try again.",
        type: "danger",
      });
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: safetyApi.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked_users"] });
      // Ideally also invalidate feed to remove blocked user's content
      showMessage({
        message: "User blocked",
        type: "success",
      });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: safetyApi.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked_users"] });
      showMessage({
        message: "User unblocked",
        type: "success",
      });
    },
  });
};

export const useBlockedUsers = () => {
  return useQuery({
    queryKey: ["blocked_users"],
    queryFn: safetyApi.getBlockedUsers,
  });
};
