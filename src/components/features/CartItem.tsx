/**
 * Cart Item component (theme-aware)
 */

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../lib/constants";
import type { CartItem as CartItemType } from "../../lib/types";
import { useColors } from "../../lib/theme";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const c = useColors();

  const imageUri = item.dish.picture
    ? item.dish.picture.startsWith("http")
      ? item.dish.picture
      : `${API_BASE_URL}/uploads/dishes/${item.dish.picture}`
    : null;

  const dec = () => onUpdateQuantity(Math.max(1, item.quantity - 1));
  const inc = () => onUpdateQuantity(item.quantity + 1);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { backgroundColor: c.border }]}
        />
      ) : (
        <View
          style={[styles.imagePlaceholder, { backgroundColor: c.background }]}
        >
          <Ionicons name="restaurant-outline" size={24} color={c.textMuted} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
          {item.dish.name}
        </Text>

        <Text style={[styles.price, { color: c.primary }]}>
          {(item.dish.price * item.quantity).toLocaleString()} ₸
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: c.pillBg, borderColor: c.pillBorder },
            ]}
            onPress={dec}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={18} color={c.text} />
          </TouchableOpacity>

          <Text style={[styles.quantity, { color: c.text }]}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: c.pillBg, borderColor: c.pillBorder },
            ]}
            onPress={inc}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color={c.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  price: {
    fontSize: 16,
    fontWeight: "900",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "800",
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
});
