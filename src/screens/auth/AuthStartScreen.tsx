/**
 * Auth Stack Navigator
 * Flow:
 * Start -> RoleSelect -> (Login or Register with role)
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AuthScreenProps, AuthStackParamList } from "../../navigation/types";
import { useColors } from "../../lib/theme";
import { UserRole } from "../../lib/types";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

const Stack = createStackNavigator<AuthStackParamList>();

function PillButton({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const c = useColors();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.pillBtn,
        { backgroundColor: c.pillBg, borderColor: c.pillBorder },
      ]}
    >
      <View style={styles.pillLeft}>
        <View
          style={[
            styles.pillIconWrap,
            { backgroundColor: c.pillIconBg, borderColor: c.pillIconBorder },
          ]}
        >
          <Ionicons name={icon} size={20} color={c.primary} />
        </View>
        <Text style={[styles.pillTitle, { color: c.text }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
    </TouchableOpacity>
  );
}

/**
 * Start screen: choose Login or Register
 */
const StartScreen = ({ navigation }: AuthScreenProps<"Start">) => {
  const c = useColors();

  return (
    <LinearGradient colors={[c.gradientFrom, c.gradientTo]} style={{ flex: 1 }}>
      <View style={styles.startContainer}>
        <View style={styles.brand}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: c.pillIconBg, borderColor: c.pillIconBorder },
            ]}
          >
            <Text style={styles.logoEmoji}>🍳</Text>
          </View>
          <Text style={[styles.brandTitle, { color: c.text }]}>Chef</Text>
          <Text style={[styles.brandSub, { color: c.textSecondary }]}>
            Домашняя еда от лучших поваров рядом с тобой
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: c.text }]}>Начнём</Text>

          <PillButton
            title="Войти"
            icon="log-in-outline"
            onPress={() =>
              navigation.navigate("RoleSelect", { action: "login" })
            }
          />

          <PillButton
            title="Зарегистрироваться"
            icon="person-add-outline"
            onPress={() =>
              navigation.navigate("RoleSelect", { action: "register" })
            }
          />

          <Text style={[styles.hint, { color: c.textMuted }]}>
            Сначала выбери действие, потом роль (клиент или шеф)
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </View>
    </LinearGradient>
  );
};

/**
 * Role select screen: choose Chef / Customer, then go to Login/Register
 */
const RoleSelectScreen = ({
  route,
  navigation,
}: AuthScreenProps<"RoleSelect">) => {
  const c = useColors();
  const action = route.params.action;

  const title = useMemo(
    () => (action === "login" ? "Войти как…" : "Зарегистрироваться как…"),
    [action]
  );

  const go = (role: UserRole) => {
    if (action === "login") navigation.navigate("Login", { role });
    else navigation.navigate("Register", { role });
  };

  return (
    <LinearGradient colors={[c.gradientFrom, c.gradientTo]} style={{ flex: 1 }}>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            { backgroundColor: c.pillBg, borderColor: c.pillBorder },
          ]}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
          <Text style={[styles.backText, { color: c.text }]}>Назад</Text>
        </TouchableOpacity>

        <Text style={[styles.roleTitle, { color: c.text }]}>{title}</Text>
        <Text style={[styles.roleSub, { color: c.textSecondary }]}>
          Роль влияет на то, какие функции будут доступны в приложении
        </Text>

        <View
          style={[
            styles.roleCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          {/* Исправлено: передаем "customer" вместо "user" */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => go("customer")}
            style={styles.roleRow}
          >
            <View
              style={[
                styles.roleIcon,
                {
                  backgroundColor: c.pillIconBg,
                  borderColor: c.pillIconBorder,
                },
              ]}
            >
              <Ionicons name="person-outline" size={22} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.roleRowTitle, { color: c.text }]}>
                Пользователь
              </Text>
              <Text style={[styles.roleRowSub, { color: c.textSecondary }]}>
                Смотреть видео, лайкать, заказывать еду
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: c.divider }]} />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => go("chef")}
            style={styles.roleRow}
          >
            <View
              style={[
                styles.roleIcon,
                {
                  backgroundColor: c.pillIconBg,
                  borderColor: c.pillIconBorder,
                },
              ]}
            >
              <Ionicons name="restaurant-outline" size={22} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.roleRowTitle, { color: c.text }]}>Шеф</Text>
              <Text style={[styles.roleRowSub, { color: c.textSecondary }]}>
                Публиковать видео и продавать блюда
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.roleHint, { color: c.textMuted }]}>
          Если выберешь “Шеф”, позже можно будет пройти расширенную настройку
          профиля.
        </Text>
      </View>
    </LinearGradient>
  );
};

export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Start"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen as any} />
      <Stack.Screen name="Register" component={RegisterScreen as any} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  startContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    justifyContent: "space-between",
  },
  brand: {
    marginTop: 18,
    alignItems: "center",
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 32 },
  brandTitle: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  brandSub: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  pillBtn: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pillLeft: { flexDirection: "row", alignItems: "center" },
  pillIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pillTitle: { fontSize: 16, fontWeight: "700" },
  hint: { marginTop: 8, fontSize: 12, lineHeight: 16 },

  roleContainer: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  backText: { fontSize: 14, fontWeight: "700" },
  roleTitle: { marginTop: 18, fontSize: 26, fontWeight: "900" },
  roleSub: { marginTop: 8, fontSize: 13, lineHeight: 18 },
  roleCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  roleRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  roleRowTitle: { fontSize: 16, fontWeight: "800" },
  roleRowSub: { marginTop: 3, fontSize: 12 },
  divider: { height: 1, marginLeft: 14, marginRight: 14 },
  roleHint: { marginTop: 14, fontSize: 12, lineHeight: 16 },
});
