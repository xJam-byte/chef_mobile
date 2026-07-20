/**
 * Кошелёк: баланс коинов, статус, история транзакций.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../lib/theme";
import { PremiumHeader, Spinner } from "../components/ui";
import { TIER_COLORS } from "../components/StatusCard";
import { useWallet, useWalletTransactions } from "../lib/hooks/useWallet";
import type { CoinTransaction, CoinTransactionType } from "../lib/types";

const TX_ICONS: Record<CoinTransactionType, keyof typeof Ionicons.glyphMap> = {
  cashback: "cash-outline",
  referral_bonus: "people-outline",
  taster_reward: "restaurant-outline",
  order_payment: "cart-outline",
  order_refund: "refresh-outline",
  battle_prize: "trophy-outline",
  admin_adjust: "construct-outline",
};

export default function WalletScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { data: wallet, isLoading, refetch, isRefetching } = useWallet();
  const {
    data: txPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchTxs,
  } = useWalletTransactions();

  const transactions =
    txPages?.pages.flatMap((page) => page.items) ?? [];

  const tierColor = wallet ? TIER_COLORS[wallet.tier] : c.primary;

  const renderTx = ({ item }: { item: CoinTransaction }) => {
    const positive = item.amount > 0;
    return (
      <View style={[styles.txRow, { borderBottomColor: c.divider }]}>
        <View style={[styles.txIcon, { backgroundColor: c.pillBg }]}>
          <Ionicons
            name={TX_ICONS[item.type] ?? "ellipse-outline"}
            size={18}
            color={positive ? c.success : c.error}
          />
        </View>
        <View style={styles.txInfo}>
          <Text style={[styles.txType, { color: c.text }]}>
            {t(`wallet.txTypes.${item.type}`)}
          </Text>
          <Text style={[styles.txDate, { color: c.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: positive ? c.success : c.error },
          ]}
        >
          {positive ? "+" : ""}
          {item.amount.toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("wallet.title")} backButton />
      {isLoading || !wallet ? (
        <Spinner fullScreen />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.tx_id)}
          renderItem={renderTx}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
                refetchTxs();
              }}
              tintColor={c.primary}
            />
          }
          ListHeaderComponent={
            <View>
              <View
                style={[
                  styles.balanceCard,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text style={[styles.balanceLabel, { color: c.textSecondary }]}>
                  {t("wallet.balance")}
                </Text>
                <View style={styles.balanceValueRow}>
                  <Text style={[styles.balanceValue, { color: c.text }]}>
                    {wallet.balance.toLocaleString()}
                  </Text>
                  <Text style={[styles.balanceUnit, { color: c.primary }]}>
                    {t("wallet.coins")}
                  </Text>
                </View>
                <View
                  style={[styles.tierPill, { backgroundColor: tierColor + "22" }]}
                >
                  <Ionicons name="medal" size={14} color={tierColor} />
                  <Text style={[styles.tierText, { color: tierColor }]}>
                    {t(`tiers.${wallet.tier}`)} ·{" "}
                    {t("wallet.cashbackRate", {
                      percent: Math.round(wallet.cashback_rate * 100),
                    })}
                  </Text>
                </View>
                {wallet.next_tier && (
                  <Text style={[styles.nextTier, { color: c.textMuted }]}>
                    {t("wallet.progressToNext", {
                      amount: wallet.next_tier.remaining.toLocaleString(),
                      tier: t(`tiers.${wallet.next_tier.tier}`),
                    })}
                  </Text>
                )}
              </View>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                {t("wallet.history")}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: c.textMuted }]}>
              {t("wallet.noTransactions")}
            </Text>
          }
          ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 32 },
  balanceCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  balanceLabel: { fontSize: 14 },
  balanceValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginTop: 4,
  },
  balanceValue: { fontSize: 36, fontWeight: "800" },
  balanceUnit: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
  },
  tierText: { fontSize: 13, fontWeight: "700" },
  nextTier: { fontSize: 12, marginTop: 8 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 4,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txType: { fontSize: 15, fontWeight: "600" },
  txDate: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 24, fontSize: 14 },
});
