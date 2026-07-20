import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyBadges,
  getMyReferralInfo,
  redeemReferralCode,
} from "../api/referral";
import { QUERY_KEYS } from "../constants";

export const useReferralInfo = () =>
  useQuery({
    queryKey: QUERY_KEYS.REFERRAL(),
    queryFn: getMyReferralInfo,
  });

export const useRedeemReferral = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => redeemReferralCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REFERRAL() });
    },
  });
};

export const useMyBadges = () =>
  useQuery({
    queryKey: QUERY_KEYS.BADGES(),
    queryFn: getMyBadges,
  });
