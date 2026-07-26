import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../../lib/theme";

interface ChefStatsCardsProps {
  totalEarnings: number;
  subscribers: number;
  followingCount: number;
  formatCurrency: (value: number) => string;
}

export const ChefStatsCards: React.FC<ChefStatsCardsProps> = ({
  totalEarnings,
  subscribers,
  followingCount,
  formatCurrency,
}) => {
  const c = useColors();
  const { t } = useTranslation();

  return (
    <View style={styles.statsContainer}>
      <TouchableOpacity
        style={[
          styles.statCard,
          { backgroundColor: c.card, shadowColor: c.text },
        ]}
      >
        <View style={[styles.statIcon, { backgroundColor: c.text + "08" }]}>
          <Ionicons name="wallet-outline" size={20} color={c.text} />
        </View>
        <Text style={[styles.statValue, { color: c.text }]}>
          {formatCurrency(totalEarnings)}
        </Text>
        <Text
          style={[styles.statLabel, { color: c.textSecondary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {t("chef.earnings")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.statCard,
          { backgroundColor: c.card, shadowColor: c.text },
        ]}
      >
        <View style={[styles.statIcon, { backgroundColor: c.primary + "15" }]}>
          <Ionicons name="people-outline" size={20} color={c.primary} />
        </View>
        <Text style={[styles.statValue, { color: c.primary }]}>
          {subscribers}
        </Text>
        <Text
          style={[styles.statLabel, { color: c.textSecondary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {t("chef.subscribers")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.statCard,
          { backgroundColor: c.card, shadowColor: c.text },
        ]}
      >
        <View style={[styles.statIcon, { backgroundColor: c.text + "08" }]}>
          <Ionicons name="heart-outline" size={20} color={c.text} />
        </View>
        <Text style={[styles.statValue, { color: c.text }]}>
          {followingCount}
        </Text>
        <Text
          style={[styles.statLabel, { color: c.textSecondary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {t("chef.following")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: -20,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
