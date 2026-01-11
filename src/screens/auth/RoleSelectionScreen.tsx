import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { AuthScreenProps } from "../../navigation/types";
import { UserRole } from "../../lib/types";
import { useBecomeChef } from "../../lib/hooks";
import { useQueryClient } from "@tanstack/react-query";

export default function RoleSelectionScreen({
  navigation,
}: AuthScreenProps<"RoleSelection">) {
  const c = useColors();
  const queryClient = useQueryClient();
  const becomeChefMutation = useBecomeChef();
  const [loading, setLoading] = useState(false);

  const profile = queryClient.getQueryData<any>(["profile"]);

  const selectRole = async (role: UserRole) => {
    if (!profile?.user_id) {
      Alert.alert("Ошибка", "Профиль пользователя не найден");
      return;
    }

    setLoading(true);

    try {
      if (role === "chef") {
        // Use existing becomeChef endpoint
        await becomeChefMutation.mutateAsync({
          userId: profile.user_id,
          bio: "",
        });
      }
      // For customer role, the backend should set it by default
      // or we can use a different endpoint if needed

      // Refresh user profile to get updated role
      await queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Navigation will happen automatically via RootNavigator
      // once the profile is updated with the new role
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Не удалось установить роль";
      Alert.alert("Ошибка", message);
      setLoading(false);
    }
  };

  // Vibrant light color scheme
  const lightGradient: readonly [string, string, string] = ["#FFF7ED", "#FFEDD5", "#FED7AA"];
  const cardColor = "#FFFFFF";
  const primaryColor = "#F97316";
  const secondaryColor = "#EA580C";
  const textDark = "#1C1917";
  const textMuted = "#78716C";

  return (
    <LinearGradient colors={lightGradient} style={styles.root}>
      <View style={styles.wrap}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: primaryColor }]}>
            <Ionicons name="person-add" size={32} color="#fff" />
          </View>
          <Text style={[styles.title, { color: textDark }]}>
            Выбери свою роль
          </Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            Ты можешь изменить роль позже в настройках профиля
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {/* Customer Card */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: cardColor,
                borderColor: primaryColor + "30",
              },
            ]}
            activeOpacity={0.85}
            onPress={() => selectRole("customer")}
            disabled={loading}
          >
            <LinearGradient
              colors={[primaryColor + "15", primaryColor + "05"]}
              style={styles.cardGradient}
            >
              <View
                style={[
                  styles.roleIconWrap,
                  { backgroundColor: primaryColor + "20" },
                ]}
              >
                <Ionicons name="person" size={32} color={primaryColor} />
              </View>

              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: textDark }]}>
                  Пользователь
                </Text>
                <Text style={[styles.cardText, { color: textMuted }]}>
                  Смотри видео, выбирай блюда от лучших поваров и заказывай с
                  доставкой
                </Text>
              </View>

              <View style={styles.cardBadge}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={primaryColor}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Chef Card */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: cardColor,
                borderColor: secondaryColor + "30",
              },
            ]}
            activeOpacity={0.85}
            onPress={() => selectRole("chef")}
            disabled={loading}
          >
            <LinearGradient
              colors={[secondaryColor + "15", secondaryColor + "05"]}
              style={styles.cardGradient}
            >
              <View
                style={[
                  styles.roleIconWrap,
                  { backgroundColor: secondaryColor + "20" },
                ]}
              >
                <Ionicons name="restaurant" size={32} color={secondaryColor} />
              </View>

              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: textDark }]}>
                  Шеф-повар
                </Text>
                <Text style={[styles.cardText, { color: textMuted }]}>
                  Публикуй видео своих блюд, принимай заказы и развивай свой
                  бизнес
                </Text>
              </View>

              <View style={styles.cardBadge}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={secondaryColor}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color={primaryColor} />
            <Text style={[styles.featureText, { color: textMuted }]}>
              Безопасно
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flash" size={20} color={primaryColor} />
            <Text style={[styles.featureText, { color: textMuted }]}>
              Быстро
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="star" size={20} color={primaryColor} />
            <Text style={[styles.featureText, { color: textMuted }]}>
              Надежно
            </Text>
          </View>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingBox, { backgroundColor: cardColor }]}>
            <Animated.View>
              <Ionicons name="hourglass" size={32} color={primaryColor} />
            </Animated.View>
            <Text style={[styles.loadingText, { color: textDark }]}>
              Настраиваем профиль...
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: { flex: 1, padding: 24, paddingTop: 80 },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  roleIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
  },
  feature: {
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: {
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
});