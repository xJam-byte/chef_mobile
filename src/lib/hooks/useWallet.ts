import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getWallet, getWalletTransactions } from "../api/wallet";
import { QUERY_KEYS } from "../constants";

export const useWallet = () =>
  useQuery({
    queryKey: QUERY_KEYS.WALLET(),
    queryFn: getWallet,
  });

export const useWalletTransactions = () =>
  useInfiniteQuery({
    queryKey: QUERY_KEYS.WALLET_TRANSACTIONS(),
    queryFn: ({ pageParam }) =>
      getWalletTransactions(pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
