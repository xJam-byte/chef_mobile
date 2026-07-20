import { apiClient } from "./client";

export interface Battle {
  battle_id: number;
  month: string;
  category: string;
  theme: string;
  themeDishes?: { name: string; description?: string }[] | null;
  status: "upcoming" | "active" | "finished";
  startsAt: string;
  endsAt: string;
  winnerEntryId?: number | null;
  my_entry?: { entry_id: number; dishId: number } | null;
  _count?: { entries: number };
}

export interface BattleEntry {
  entry_id: number;
  chef: {
    chef_id: number;
    rating: string;
    users?: { user_id: number; name: string; profile_pic?: string | null };
  };
  dish: {
    dish_id: number;
    name: string;
    picture?: string | null;
    price?: string;
  } | null;
  videoId?: string | null;
  score: number;
  orders_count: number;
  likes_count: number;
  is_winner: boolean;
}

export interface BattleLeaderboard {
  battle: Battle;
  entries: BattleEntry[];
}

export interface FinishedBattle extends Battle {
  winner: {
    chef: BattleEntry["chef"];
    dish: BattleEntry["dish"];
    score?: string | number | null;
  } | null;
}

export const getCurrentBattles = async (): Promise<Battle[]> => {
  const response = await apiClient.get<Battle[]>("/v1/battles/current");
  return response.data;
};

export const getBattleEntries = async (
  battleId: number
): Promise<BattleLeaderboard> => {
  const response = await apiClient.get<BattleLeaderboard>(
    `/v1/battles/${battleId}/entries`
  );
  return response.data;
};

export const getBattleHistory = async (): Promise<FinishedBattle[]> => {
  const response = await apiClient.get<FinishedBattle[]>("/v1/battles/history");
  return response.data;
};

export const submitBattleEntry = async (
  battleId: number,
  dishId: number,
  videoId?: string
) => {
  const response = await apiClient.post(`/v1/battles/${battleId}/entries`, {
    dishId,
    videoId,
  });
  return response.data;
};

export interface TopChefRow {
  position: number;
  delivered_orders: number;
  chef: {
    chef_id: number;
    rating: string;
    rank_tier?: string | null;
    users?: { user_id: number; name: string; profile_pic?: string | null };
  } | null;
}

export const getTopChefs = async (month?: string): Promise<TopChefRow[]> => {
  const response = await apiClient.get<TopChefRow[]>("/v1/chefs/top", {
    params: { month },
  });
  return response.data;
};
