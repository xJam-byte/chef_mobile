import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBattleEntries,
  getBattleHistory,
  getCurrentBattles,
  getTopChefs,
  submitBattleEntry,
} from "../api/battles";
import { QUERY_KEYS } from "../constants";

export const useCurrentBattles = () =>
  useQuery({
    queryKey: QUERY_KEYS.BATTLES(),
    queryFn: getCurrentBattles,
  });

export const useBattleEntries = (battleId?: number) =>
  useQuery({
    queryKey: QUERY_KEYS.BATTLE_ENTRIES(battleId),
    queryFn: () => getBattleEntries(battleId!),
    enabled: !!battleId,
  });

export const useBattleHistory = () =>
  useQuery({
    queryKey: QUERY_KEYS.BATTLE_HISTORY(),
    queryFn: getBattleHistory,
  });

export const useSubmitBattleEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { battleId: number; dishId: number; videoId?: string }) =>
      submitBattleEntry(vars.battleId, vars.dishId, vars.videoId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BATTLES() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BATTLE_ENTRIES(vars.battleId),
      });
    },
  });
};

export const useTopChefs = (month?: string) =>
  useQuery({
    queryKey: QUERY_KEYS.TOP_CHEFS(month),
    queryFn: () => getTopChefs(month),
  });
