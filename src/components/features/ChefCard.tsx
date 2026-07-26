/**
 * Chef Card component (theme-aware)
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Card, Avatar, StarRating } from "../ui";
import { API_BASE_URL } from "../../lib/constants";
import type { Chef } from "../../lib/types";
import { useColors } from "../../lib/theme";

interface ChefCardProps {
  chef: Chef;
  onPress?: () => void;
}

export const ChefCard: React.FC<ChefCardProps> = ({ chef, onPress }) => {
  const c = useColors();
  const { t } = useTranslation();

  const user = chef.users ?? chef.user;
  const avatarUri = user?.profile_pic
    ? user.profile_pic.startsWith("http")
      ? user.profile_pic
      : `${API_BASE_URL}${user.profile_pic}`
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Avatar uri={avatarUri} name={user?.name} size="lg" />
          <View style={styles.info}>
            <Text style={[styles.name, { color: c.text }]}>
              {user?.name || t("common.chef")}
            </Text>
            <StarRating rating={chef.rating} size={16} />
          </View>
        </View>

        {chef.bio ? (
          <Text
            style={[styles.bio, { color: c.textSecondary }]}
            numberOfLines={2}
          >
            {chef.bio}
          </Text>
        ) : null}

        {user?.phone_number ? (
          <View style={[styles.contact, { borderTopColor: c.divider }]}>
            <Text style={[styles.contactLabel, { color: c.textMuted }]}>
              {t("common.phone", "Phone")}:
            </Text>
            <Text style={[styles.contactValue, { color: c.text }]}>
              {user.phone_number}
            </Text>
          </View>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center" },
  info: { marginLeft: 16, flex: 1 },
  name: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  bio: { fontSize: 14, lineHeight: 20, marginTop: 12 },
  contact: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  contactLabel: { fontSize: 14 },
  contactValue: { fontSize: 14, fontWeight: "700", marginLeft: 8 },
});
