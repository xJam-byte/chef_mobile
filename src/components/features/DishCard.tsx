/**
 * Dish Card component (theme-aware)
 */

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge } from "../ui";
import { DISH_TYPES, API_BASE_URL } from "../../lib/constants";
import type { Dish } from "../../lib/types";
import { useColors } from "../../lib/theme";

interface DishCardProps {
  dish: Dish;
  onPress?: () => void;
  onAddToCart?: () => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  onPress,
  onAddToCart,
}) => {
  const c = useColors();

  const imageUri = dish.picture
    ? dish.picture.startsWith("http")
      ? dish.picture
      : `${API_BASE_URL}/uploads/dishes/${dish.picture}`
    : null;

  const isAvailable = dish.availability_status === "available";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <Card style={styles.card} padding="none">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { backgroundColor: c.border }]}
          />
        ) : (
          <View
            style={[styles.imagePlaceholder, { backgroundColor: c.background }]}
          >
            <Ionicons name="restaurant-outline" size={48} color={c.textMuted} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
              {dish.name}
            </Text>
            <Badge
              text={isAvailable ? "В наличии" : "Нет в наличии"}
              variant={isAvailable ? "success" : "error"}
              size="sm"
            />
          </View>

          {dish.description ? (
            <Text
              style={[styles.description, { color: c.textSecondary }]}
              numberOfLines={2}
            >
              {dish.description}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <Text style={[styles.type, { color: c.textMuted }]}>
              {DISH_TYPES[dish.type as keyof typeof DISH_TYPES] || dish.type}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.price, { color: c.primary }]}>
              {dish.price.toLocaleString()} ₸
            </Text>

            {onAddToCart && isAvailable ? (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: c.primary }]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onAddToCart();
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 16, overflow: "hidden" },
  image: { width: "100%", height: 160 },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: { fontSize: 18, fontWeight: "800", flex: 1, marginRight: 8 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  meta: { flexDirection: "row", marginBottom: 12 },
  type: { fontSize: 12, textTransform: "uppercase" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontSize: 20, fontWeight: "900" },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
