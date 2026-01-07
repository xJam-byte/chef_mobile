import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

type Props = { navigation: any };

export default function RoleSelectScreen({ navigation }: Props) {
  const c = useColors();

  const selectRole = async (_role: "chef" | "user") => {
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <LinearGradient colors={c.authGradient} style={styles.root}>
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: "#fff" }]}>Кто ты?</Text>
        <Text
          style={[
            styles.subtitle,
            { color: c.name === "dark" ? "#9CA3AF" : "#FED7AA" },
          ]}
        >
          Выбери роль — можно изменить позже в профиле.
        </Text>

        <TouchableOpacity
          style={[
            styles.card,
            { borderColor: c.authCardBorder, backgroundColor: c.authCard },
          ]}
          activeOpacity={0.9}
          onPress={() => selectRole("user")}
        >
          <View
            style={[styles.iconWrap, { backgroundColor: c.primary + "22" }]}
          >
            <Ionicons name="person" size={22} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>
              Пользователь
            </Text>
            <Text style={[styles.cardText, { color: c.textMuted }]}>
              Смотри видео, выбирай блюда, заказывай.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            { borderColor: c.authCardBorder, backgroundColor: c.authCard },
          ]}
          activeOpacity={0.9}
          onPress={() => selectRole("chef")}
        >
          <View
            style={[styles.iconWrap, { backgroundColor: c.primary + "22" }]}
          >
            <Ionicons name="restaurant" size={22} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Шеф</Text>
            <Text style={[styles.cardText, { color: c.textMuted }]}>
              Публикуй видео, принимай заказы, развивайся.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 30, fontWeight: "900" },
  subtitle: { fontSize: 14, marginTop: 8, marginBottom: 18 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardText: { fontSize: 13, marginTop: 4, lineHeight: 18 },
});
