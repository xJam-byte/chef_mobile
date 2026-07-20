/**
 * Ряд бейджей пользователя (первооткрыватель / дегустатор / ранний пользователь)
 * с прогрессом первооткрывателя.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../lib/theme";
import { useMyBadges } from "../lib/hooks/useReferral";
import type { BadgeItem } from "../lib/api/referral";

const BADGE_META: Record<
  BadgeItem["type"],
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  pioneer: { icon: "compass", color: "#0EA5E9" },
  taster: { icon: "restaurant", color: "#10B981" },
  early_user: { icon: "star", color: "#F59E0B" },
};

export const BadgesRow: React.FC = () => {
  const { t } = useTranslation();
  const c = useColors();
  const { data } = useMyBadges();

  if (!data) return null;
  const { badges, pioneer_progress } = data;
  const hasPioneer = badges.some((b) => b.type === "pioneer");
  if (badges.length === 0 && pioneer_progress.current === 0) return null;

  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
    >
      <View style={styles.badgesWrap}>
        {badges.map((b) => {
          const meta = BADGE_META[b.type];
          const expired = b.expiresAt && new Date(b.expiresAt) < new Date();
          return (
            <View
              key={b.badge_id}
              style={[
                styles.badgePill,
                { backgroundColor: meta.color + (expired ? "10" : "22") },
              ]}
            >
              <Ionicons
                name={meta.icon}
                size={14}
                color={expired ? c.textMuted : meta.color}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: expired ? c.textMuted : meta.color },
                ]}
              >
                {t(`badges.${b.type}`)}
                {b.type === "pioneer" && !expired
                  ? ` · −20%`
                  : ""}
              </Text>
            </View>
          );
        })}
      </View>
      {!hasPioneer && pioneer_progress.current > 0 && (
        <Text style={[styles.progress, { color: c.textSecondary }]}>
          {t("badges.pioneerProgress", {
            current: pioneer_progress.current,
            required: pioneer_progress.required,
          })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  progress: { fontSize: 12, marginTop: 8 },
});
