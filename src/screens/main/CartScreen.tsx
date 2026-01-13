/**
 * Cart Screen
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import { CartItem } from "../../components/features";
import { Button } from "../../components/ui";
import { useCreateOrder, useProfile, useCart } from "../../lib/hooks";
import { useColors } from "../../lib/theme";

const CartScreen = () => {
  const c = useColors();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { data: profile } = useProfile();
  const createOrderMutation = useCreateOrder();

  console.log("[CartScreen] Items count:", items.length);
  console.log("[CartScreen] Items:", items);

  const handleOrder = async () => {
    if (!profile?.user_id) {
      Alert.alert("Ошибка", "Не удалось определить пользователя");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Корзина пуста", "Добавьте блюда в корзину");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        userId: profile.user_id,
        total_price: totalPrice,
        status: "pending",
        items: items.map((item) => ({
          dishId: item.dish.dish_id,
          quantity: item.quantity,
          preferences: item.preferences,
          price: item.dish.price,
        })),
      });

      clearCart();
      showMessage({
        message: "Заказ оформлен!",
        description: "Повар получит уведомление о вашем заказе",
        type: "success",
        icon: "success",
      });
    } catch (error: any) {
      Alert.alert("Ошибка", "Не удалось оформить заказ");
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: c.background }]}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={[styles.emptyTitle, { color: c.text }]}>
          Корзина пуста
        </Text>
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          Добавьте блюда из меню
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.dish.dish_id.toString()}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={(qty) => updateQuantity(item.dish.dish_id, qty)}
            onRemove={() => removeItem(item.dish.dish_id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.footer,
          {
            backgroundColor: c.surface,
            borderTopColor: c.border,
          },
        ]}
      >
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: c.textSecondary }]}>
            Итого:
          </Text>
          <Text style={[styles.totalValue, { color: c.primary }]}>
            {totalPrice.toLocaleString()} ₸
          </Text>
        </View>

        <Button
          title="Оформить заказ"
          onPress={handleOrder}
          loading={createOrderMutation.isPending}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  emptyText: { fontSize: 16, textAlign: "center" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: { fontSize: 18 },
  totalValue: { fontSize: 24, fontWeight: "800" },
});
