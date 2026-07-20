/**
 * Карточка статуса лояльности: текущий tier, прогресс до следующего, % кешбэка.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../lib/theme";
import { useWallet } from "../lib/hooks/useWallet";
import type { UserTier } from "../lib/types";

export const TIER_COLORS: Record<UserTier, string> = {
  bronze: "#CD7F32",
  silver: "#8E9BAE",
  gold: "#D4A017",
  platinum: "#7B68EE",
};

interface StatusCardProps {
  onPress?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const c = useColors();
  const { data: wallet } = useWallet();

  if (!wallet) return null;

  const tierColor = TIER_COLORS[wallet.tier] ?? c.primary;
  const progress = wallet.next_tier
    ? Math.min(wallet.lifetime_spend / wallet.next_tier.threshold, 1)
    : 1;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.tierPill, { backgroundColor: tierColor + "22" }]}>
          <Ionicons name="medal" size={16} color={tierColor} />
          <Text style={[styles.tierText, { color: tierColor }]}>
            {t(`tiers.${wallet.tier}`)}
          </Text>
        </View>
        <View style={styles.balanceRow}>
          <Ionicons name="server" size={14} color={c.primary} />
          <Text style={[styles.balanceText, { color: c.text }]}>
            {wallet.balance.toLocaleString()} {t("wallet.coins")}
          </Text>
        </View>
      </View>

      <Text style={[styles.cashback, { color: c.textSecondary }]}>
        {t("wallet.cashbackRate", {
          percent: Math.round(wallet.cashback_rate * 100),
        })}
      </Text>

      <View style={[styles.progressTrack, { backgroundColor: c.pillBg }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: tierColor, width: `${progress * 100}%` },
          ]}
        />
      </View>

      {wallet.next_tier ? (
        <Text style={[styles.progressLabel, { color: c.textMuted }]}>
          {t("wallet.progressToNext", {
            amount: wallet.next_tier.remaining.toLocaleString(),
            tier: t(`tiers.${wallet.next_tier.tier}`),
          })}
        </Text>
      ) : (
        <Text style={[styles.progressLabel, { color: c.textMuted }]}>
          {t("wallet.maxTier")}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tierText: {
    fontSize: 14,
    fontWeight: "700",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cashback: {
    marginTop: 8,
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
  },
});
