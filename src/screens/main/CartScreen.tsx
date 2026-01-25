/**
 * Cart Screen
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button, PremiumHeader } from "../../components/ui";
import { useCart } from "../../lib/hooks";
import { useColors } from "../../lib/theme";
import type { CartItem as CartItemType } from "../../lib/types";
import { API_BASE_URL } from "../../lib/constants";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const CartScreen = () => {
  const c = useColors();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    navigation.navigate("Checkout");
  };

  const renderItem = ({ item }: { item: CartItemType }) => {
    const imageUri = item.dish.picture
      ? item.dish.picture.startsWith("http")
        ? item.dish.picture
        : `${API_BASE_URL}/uploads/dishes/${item.dish.picture}`
      : null;

    return (
      <View style={[styles.cartItem, { backgroundColor: c.card }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, { backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="restaurant" size={24} color={c.textMuted} />
          </View>
        )}
        
        <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
                <View>
                   <Text style={[styles.chefName, { color: c.textSecondary }]}>Повар</Text>
                   <Text style={[styles.dishName, { color: c.text }]} numberOfLines={1}>{item.dish.name}</Text>
                   <Text style={[styles.dishPrice, { color: c.primary }]}>{item.dish.price} ₸</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.dish.dish_id)}>
                    <Ionicons name="trash-outline" size={20} color={c.textSecondary} /> 
                </TouchableOpacity>
            </View>

            <View style={styles.quantityContainer}>
                <TouchableOpacity 
                    style={[styles.qtyButton, { backgroundColor: c.pillBg }]} 
                    onPress={() => updateQuantity(item.dish.dish_id, Math.max(1, item.quantity - 1))}
                >
                    <Ionicons name="remove" size={16} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: c.text }]}>{item.quantity}</Text>
                <TouchableOpacity 
                    style={[styles.qtyButton, { backgroundColor: c.primary }]} 
                    onPress={() => updateQuantity(item.dish.dish_id, item.quantity + 1)}
                >
                    <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <PremiumHeader title={t('cart.title')} />
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
            {t('cart.empty')}
            </Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            {t('cart.emptyDescription')}
            </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t('cart.title')} />
      {/* <SafeAreaView edges={['top']} style={{ flex: 1 }}> */}
        <FlatList
            data={items}
            keyExtractor={(item) => item.dish.dish_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={[styles.list, { paddingBottom: 140 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
        />

        <View style={[
            styles.bottomBar, 
            { 
                backgroundColor: c.background, 
                borderTopColor: c.border,
                paddingBottom: 16 + insets.bottom 
            }
        ]}>
            <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: c.textSecondary }]}>Итого</Text>
                <Text style={[styles.totalValue, { color: c.text }]}>{totalPrice.toLocaleString()} ₸</Text>
            </View>
            <TouchableOpacity 
                style={[styles.checkoutButton, { backgroundColor: c.primary }]}
                onPress={handleCheckout}
            >
                <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
            </TouchableOpacity>
        </View>
      {/* </SafeAreaView> */}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: {
      fontSize: 32,
      fontWeight: "bold", // Serif-like font in design
      paddingHorizontal: 16,
      paddingTop: 16,
      marginBottom: 16,
  },
  list: { paddingHorizontal: 16, paddingBottom: 60, marginTop: 16 },
  
  cartItem: {
      flexDirection: "row",
      padding: 12,
      borderRadius: 20,
      marginBottom: 12,
  },
  itemImage: {
      width: 80,
      height: 80,
      borderRadius: 16,
      marginRight: 12,
  },
  itemContent: {
      flex: 1,
      justifyContent: "space-between",
  },
  itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
  },
  chefName: {
      fontSize: 12,
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  dishName: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
  },
  dishPrice: {
      fontSize: 16,
      fontWeight: "600",
  },
  quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-end",
      gap: 12,
  },
  qtyButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
  },
  qtyText: {
      fontSize: 16,
      fontWeight: "600",
  },

  footerContent: {
      marginTop: 20,
      gap: 12,
  },
  infoCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 20,
  },
  infoIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(249, 115, 22, 0.1)", // Primary with opacity
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
  },
  infoTextWrapper: {
      flex: 1,
  },
  infoLabel: {
      fontSize: 12,
      marginBottom: 2,
  },
  infoValue: {
      fontSize: 15,
      fontWeight: "600",
  },
  editLink: {
      fontSize: 13,
      fontWeight: "500",
  },

  bottomBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      borderTopWidth: 0, // Removed border for cleaner look
  },
  totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
  },
  totalLabel: {
      fontSize: 16,
  },
  totalValue: {
      fontSize: 24,
      fontWeight: "700",
  },
  checkoutButton: {
      paddingVertical: 16,
      borderRadius: 20,
      alignItems: "center",
      marginBottom: -26,
  },
  checkoutButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  emptyText: { fontSize: 16, textAlign: "center" },
});
