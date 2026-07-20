import { apiClient } from "./client";
import type { CoinTransaction, WalletOverview } from "../types";

export interface WalletTransactionsPage {
  items: CoinTransaction[];
  nextCursor: number | null;
}

export const getWallet = async (): Promise<WalletOverview> => {
  const response = await apiClient.get<WalletOverview>("/v1/wallet");
  return response.data;
};

export const getWalletTransactions = async (
  cursor?: number,
  limit = 20
): Promise<WalletTransactionsPage> => {
  const response = await apiClient.get<WalletTransactionsPage>(
    "/v1/wallet/transactions",
    { params: { cursor, limit } }
  );
  return response.data;
};
