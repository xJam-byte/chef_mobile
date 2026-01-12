/**
 * Dish Detail Screen (theme-aware)
 */

import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { Button, Badge, Spinner } from "../../components/ui";
import { useDish } from "../../lib/hooks";
import { CartContext } from "../../context/CartContext";
import { DISH_TYPES, API_BASE_URL } from "../../lib/constants";
import type { RootStackScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const DishDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"DishDetail">) => {
  const c = useColors();
  const { dishId } = route.params;
  const { data: dish, isLoading, isError } = useDish(dishId);
  const cartContext = useContext(CartContext);

  if (isLoading) return <Spinner fullScreen />;

  if (isError || !dish) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.textSecondary }]}>
          Блюдо не найдено или произошла ошибка
        </Text>
        <Button
          title="Вернуться"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const imageUri = dish.picture || null;

  const isAvailable = dish.availability_status === "available";

  const handleAddToCart = () => {
    if (!isAvailable) {
      Alert.alert("Недоступно", "Это блюдо сейчас недоступно");
      return;
    }

    if (cartContext) {
      cartContext.addItem(dish, 1, "");
      showMessage({
        message: "Добавлено в корзину",
        description: dish.name,
        type: "success",
        icon: "success",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { backgroundColor: c.border }]}
            onError={(e) => console.log('Dish image load error:', imageUri, e.nativeEvent.error)}
          />
        ) : (
          <View
            style={[styles.imagePlaceholder, { backgroundColor: c.surface }]}
          >
            <Ionicons name="restaurant-outline" size={64} color={c.textMuted} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: c.text }]}>{dish.name}</Text>
            <Badge
              text={isAvailable ? "В наличии" : "Нет в наличии"}
              variant={isAvailable ? "success" : "error"}
            />
          </View>

          <Text style={[styles.type, { color: c.textMuted }]}>
            {DISH_TYPES[dish.type as keyof typeof DISH_TYPES] || dish.type}
          </Text>

          <Text style={[styles.price, { color: c.primary }]}>
            {dish.price.toLocaleString()} ₸
          </Text>

          {dish.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                Описание
              </Text>
              <Text style={[styles.description, { color: c.textSecondary }]}>
                {dish.description}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Ингредиенты
            </Text>
            <Text style={[styles.ingredients, { color: c.textSecondary }]}>
              {dish.ingredients}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: c.surface, borderTopColor: c.border },
        ]}
      >
        <Button
          title={isAvailable ? "Добавить в корзину" : "Недоступно"}
          onPress={handleAddToCart}
          disabled={!isAvailable}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
};

export default DishDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: { fontSize: 16 },

  image: { width: "100%", height: 280 },
  imagePlaceholder: {
    width: "100%",
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },

  content: { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  name: { fontSize: 26, fontWeight: "800", flex: 1, marginRight: 12 },

  type: { fontSize: 14, textTransform: "uppercase", marginBottom: 12 },
  price: { fontSize: 28, fontWeight: "800", marginBottom: 24 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 24 },
  ingredients: { fontSize: 16, lineHeight: 24 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
});
