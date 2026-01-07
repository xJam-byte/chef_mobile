/**
 * Profile Screen
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Avatar, Button } from "../../components/ui";
import { useProfile, useLogout, useBecomeChef } from "../../lib/hooks";
import { API_BASE_URL } from "../../lib/constants";
import { useColors } from "../../lib/theme";

const ProfileScreen = () => {
  const c = useColors();
  const { data: profile } = useProfile();
  const logoutMutation = useLogout();
  const becomeChefMutation = useBecomeChef();

  const handleLogout = () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const handleBecomeChef = () => {
    if (!profile?.user_id) return;

    Alert.alert(
      "Стать поваром",
      "Вы хотите зарегистрироваться как повар? Вы сможете добавлять свои блюда.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Да, стать поваром",
          onPress: async () => {
            try {
              await becomeChefMutation.mutateAsync({
                userId: profile.user_id,
              });
              Alert.alert("Успешно!", "Теперь вы зарегистрированы как повар");
            } catch (error: any) {
              const message = error.response?.data?.message || "Ошибка";
              Alert.alert("Ошибка", message);
            }
          },
        },
      ]
    );
  };

  const avatarUri = profile?.profile_pic
    ? profile.profile_pic.startsWith("http")
      ? profile.profile_pic
      : `${API_BASE_URL}${profile.profile_pic}`
    : null;

  const roleIsChef = profile?.role === "chef";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar uri={avatarUri} name={profile?.name} size="xl" />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: c.text }]}>
              {profile?.name || "Пользователь"}
            </Text>
            <Text style={[styles.email, { color: c.textSecondary }]}>
              {profile?.email}
            </Text>

            <View
              style={[
                styles.roleContainer,
                {
                  backgroundColor: "rgba(249,115,22,0.15)",
                },
              ]}
            >
              <Ionicons
                name={roleIsChef ? "restaurant" : "person"}
                size={14}
                color={c.primary}
              />
              <Text style={[styles.role, { color: c.primary }]}>
                {roleIsChef ? "Повар" : "Клиент"}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Contact Info */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          Контактная информация
        </Text>

        <View style={[styles.infoRow, { borderBottomColor: c.divider }]}>
          <Ionicons name="mail-outline" size={20} color={c.textMuted} />
          <Text style={[styles.infoLabel, { color: c.textSecondary }]}>
            Email
          </Text>
          <Text style={[styles.infoValue, { color: c.text }]}>
            {profile?.email || "—"}
          </Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: c.divider }]}>
          <Ionicons name="call-outline" size={20} color={c.textMuted} />
          <Text style={[styles.infoLabel, { color: c.textSecondary }]}>
            Телефон
          </Text>
          <Text style={[styles.infoValue, { color: c.text }]}>
            {profile?.phone_number || "—"}
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Действия</Text>

        {!roleIsChef && (
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleBecomeChef}
            disabled={becomeChefMutation.isPending}
            activeOpacity={0.85}
          >
            <Ionicons name="restaurant-outline" size={24} color={c.primary} />
            <Text style={[styles.actionText, { color: c.text }]}>
              Стать поваром
            </Text>
            <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
          </TouchableOpacity>
        )}

        {roleIsChef && (
          <View
            style={[
              styles.chefNote,
              {
                backgroundColor: "rgba(34,197,94,0.15)",
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={c.success} />
            <Text style={[styles.chefNoteText, { color: c.success }]}>
              Вы зарегистрированы как повар
            </Text>
          </View>
        )}
      </Card>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <Button
          title="Выйти из аккаунта"
          variant="outline"
          onPress={handleLogout}
          loading={logoutMutation.isPending}
          fullWidth
        />
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  profileCard: { margin: 16, marginBottom: 8 },
  profileHeader: { flexDirection: "row", alignItems: "center" },
  profileInfo: { flex: 1, marginLeft: 16 },

  name: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 8 },

  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  role: { fontSize: 12, fontWeight: "600", marginLeft: 4 },

  section: { marginHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14, marginLeft: 12, flex: 1 },
  infoValue: { fontSize: 14, fontWeight: "500" },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionText: { fontSize: 16, marginLeft: 12, flex: 1 },

  chefNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  chefNoteText: { fontSize: 14, fontWeight: "500", marginLeft: 8 },

  logoutContainer: { padding: 16, paddingTop: 24 },
  bottomPadding: { height: 32 },
});
