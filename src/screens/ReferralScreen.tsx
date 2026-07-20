/**
 * «Пригласи друга»: реферальный код, шаринг, список приглашённых.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Share,
  TouchableOpacity,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { useColors } from "../lib/theme";
import { PremiumHeader, Spinner, Badge, Button } from "../components/ui";
import { useReferralInfo } from "../lib/hooks/useReferral";

export default function ReferralScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { data, isLoading } = useReferralInfo();

  const handleShare = async () => {
    if (!data) return;
    await Share.share({
      message: t("referral.shareMessage", {
        code: data.code,
        link: data.share_link,
        bonus: data.bonus_per_friend,
      }),
    });
  };

  const handleCopy = async () => {
    if (!data) return;
    await Clipboard.setStringAsync(data.code);
    showMessage({ message: t("referral.copied"), type: "success" });
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("referral.title")} backButton />
      {isLoading || !data ? (
        <Spinner fullScreen />
      ) : (
        <FlatList
          data={data.invited}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View
                style={[
                  styles.codeCard,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Ionicons name="gift" size={32} color={c.primary} />
                <Text style={[styles.codeHint, { color: c.textSecondary }]}>
                  {t("referral.hint", { bonus: data.bonus_per_friend })}
                </Text>
                <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
                  <Text style={[styles.code, { color: c.text }]}>
                    {data.code}
                  </Text>
                  <Text style={[styles.copyHint, { color: c.textMuted }]}>
                    {t("referral.tapToCopy")}
                  </Text>
                </TouchableOpacity>
                <Button
                  title={t("referral.share")}
                  onPress={handleShare}
                  fullWidth
                />
                <Text style={[styles.earned, { color: c.success }]}>
                  {t("referral.totalEarned", {
                    amount: data.total_earned.toLocaleString(),
                  })}
                </Text>
              </View>
              {data.invited.length > 0 && (
                <Text style={[styles.sectionTitle, { color: c.text }]}>
                  {t("referral.invitedFriends")}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: c.textMuted }]}>
              {t("referral.noInvited")}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.friendRow, { borderBottomColor: c.divider }]}>
              <View style={[styles.friendIcon, { backgroundColor: c.pillBg }]}>
                <Ionicons name="person" size={18} color={c.primary} />
              </View>
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: c.text }]}>
                  {item.name || t("referral.friend")}
                </Text>
                <Text style={[styles.friendDate, { color: c.textMuted }]}>
                  {new Date(item.invitedAt).toLocaleDateString()}
                </Text>
              </View>
              <Badge
                text={
                  item.status === "completed"
                    ? t("referral.statusCompleted")
                    : t("referral.statusPending")
                }
                variant={item.status === "completed" ? "success" : "warning"}
                size="sm"
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 32 },
  codeCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  codeHint: { fontSize: 14, textAlign: "center" },
  code: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
  },
  copyHint: { fontSize: 12, textAlign: "center", marginTop: 2 },
  earned: { fontSize: 14, fontWeight: "600" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 4,
  },
  empty: { textAlign: "center", marginTop: 16, fontSize: 14 },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  friendIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: "600" },
  friendDate: { fontSize: 12, marginTop: 2 },
});
