/**
 * Home Screen - Dishes catalog
 */

import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { DishCard } from "../../components/features";
import { Spinner } from "../../components/ui";
import { useDishes } from "../../lib/hooks";
import { useColors } from "../../lib/theme";
import type { Dish } from "../../lib/types";
import type { RootStackScreenProps } from "../../navigation/types";
import { CartContext } from "../../context/CartContext";

const HomeScreen = () => {
  const c = useColors();
  const navigation =
    useNavigation<RootStackScreenProps<"Main">["navigation"]>();

  const [page, setPage] = useState(1);

  const { data, isLoading, isRefetching, refetch } = useDishes({
    page,
    limit: 20,
  }) as {
    data: { data: Dish[] } | null;
    isLoading: boolean;
    isRefetching: boolean;
    refetch: () => void;
  };

  const cartContext = useContext(CartContext);

  const handleDishPress = (dish: Dish) => {
    navigation.navigate("DishDetail", { dishId: dish.dish_id });
  };

  const handleAddToCart = (dish: Dish) => {
    if (!cartContext) return;

    cartContext.addItem(dish, 1, "");
    showMessage({
      message: "Добавлено в корзину",
      description: dish.name,
      type: "success",
      icon: "success",
    });
  };

  if (isLoading) {
    return <Spinner fullScreen text="Загрузка блюд..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.dish_id.toString()}
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            onPress={() => handleDishPress(item)}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={c.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Блюда пока не добавлены
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
