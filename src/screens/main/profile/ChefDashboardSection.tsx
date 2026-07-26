import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "../../../lib/theme";

interface ChefDashboardSectionProps {
  chefStats: any;
  chef: any;
  navigation: any;
  formatCurrency: (value: number) => string;
}

export const ChefDashboardSection: React.FC<ChefDashboardSectionProps> = ({
  chefStats,
  chef,
  navigation,
  formatCurrency,
}) => {
  const c = useColors();
  const { t } = useTranslation();

  return (
    <View style={styles.dashboardSection}>
      {/* Earnings Card with Noise/Gradient */}
      <LinearGradient
        colors={c.authGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.earningsCard, { shadowColor: c.primary }]}
      >
        <View style={styles.earningsHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Ionicons name="card" size={20} color="#fff" />
          </View>
          <Text
            style={[styles.earningsTitle, { color: "rgba(255,255,255,0.9)" }]}
          >
            {t("chef.totalEarnings")}
          </Text>
          <TouchableOpacity style={{ marginLeft: "auto" }}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.earningsAmount}>
          {formatCurrency(chefStats?.totalEarnings || 0)} ₸
        </Text>
        <View style={styles.earningsFooter}>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              +12%
            </Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            {t("chef.thisMonth")}:{" "}
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              +{formatCurrency(chefStats?.monthlyEarnings || 0)} ₸
            </Text>
          </Text>
        </View>

        {/* Decorative Circles */}
        <View
          style={[
            styles.decoCircle,
            { right: -30, top: -20, width: 100, height: 100 },
          ]}
        />
        <View
          style={[
            styles.decoCircle,
            { left: -20, bottom: -40, width: 80, height: 80 },
          ]}
        />
      </LinearGradient>

      {/* Commission / Rank Card */}
      <View
        style={[
          styles.commissionCard,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={styles.commissionRow}>
          <View style={styles.commissionItem}>
            <Text style={[styles.commissionValue, { color: c.text }]}>
              {chefStats?.commissionRate ?? 15}%
            </Text>
            <Text style={[styles.commissionLabel, { color: c.textSecondary }]}>
              {t("chef.commission")}
            </Text>
          </View>
          <View style={styles.commissionItem}>
            <Text style={[styles.commissionValue, { color: c.text }]}>
              {formatCurrency(chefStats?.netRevenue || 0)} ₸
            </Text>
            <Text style={[styles.commissionLabel, { color: c.textSecondary }]}>
              {t("chef.netRevenue")}
            </Text>
          </View>
          <View style={styles.commissionItem}>
            {chefStats?.rankTier ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons name="trophy" size={16} color="#D4A017" />
                <Text style={[styles.commissionValue, { color: "#D4A017" }]}>
                  {t(`chef.rank_${chefStats.rankTier}`)}
                </Text>
              </View>
            ) : (
              <Text style={[styles.commissionValue, { color: c.textMuted }]}>
                —
              </Text>
            )}
            <Text style={[styles.commissionLabel, { color: c.textSecondary }]}>
              {t("chef.monthlyRank")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.battleLink}
          onPress={() => navigation.navigate("Battle")}
        >
          <Ionicons name="trophy-outline" size={16} color={c.primary} />
          <Text style={{ color: c.primary, fontWeight: "600", fontSize: 13 }}>
            {t("battle.title")}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={c.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.battleLink}
          onPress={() => navigation.navigate("ChefSchedule")}
        >
          <Ionicons name="time-outline" size={16} color={c.textSecondary} />
          <Text style={{ color: c.textSecondary, fontWeight: "600", fontSize: 13 }}>
            {t("schedule.title")}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={c.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.battleLink}
          onPress={() => navigation.navigate("Certification")}
        >
          <Ionicons name="shield-checkmark-outline" size={16} color={c.info} />
          <Text style={{ color: c.info, fontWeight: "600", fontSize: 13 }}>
            {chef?.is_certified
              ? t("certification.certified")
              : t("certification.title")}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={c.info} />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
          onPress={() => navigation.navigate("AddDish")}
        >
          <LinearGradient
            colors={[c.primary + "20", c.primary + "05"]}
            style={styles.actionBtnGradient}
          >
            <View style={[styles.actionIcon, { backgroundColor: c.primary }]}>
              <Ionicons name="add" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionBtnTitle, { color: c.text }]}>
              {t("chef.addDish")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
          onPress={() => navigation.navigate("AddVideo")}
        >
          <LinearGradient
            colors={[c.secondary + "20", c.secondary + "05"]}
            style={styles.actionBtnGradient}
          >
            <View style={[styles.actionIcon, { backgroundColor: c.text }]}>
              <Ionicons name="videocam" size={24} color={c.background} />
            </View>
            <Text style={[styles.actionBtnTitle, { color: c.text }]}>
              {t("chef.addVideo")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardSection: {
    padding: 16,
    gap: 16,
  },
  earningsCard: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  decoCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  earningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    zIndex: 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  earningsTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    position: "relative",
    zIndex: 2,
  },
  earningsFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    position: "relative",
    zIndex: 2,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  commissionCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  commissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  commissionItem: {
    gap: 4,
  },
  commissionValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  commissionLabel: {
    fontSize: 12,
  },
  battleLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
    gap: 8,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionBtnGradient: {
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
});
