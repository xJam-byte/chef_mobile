/**
 * Dish Detail Screen (theme-aware)
 * Premium "Bomb" Design
 */

import React, { useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Badge, Spinner } from "../../components/ui";
import { useDish, useProfile } from "../../lib/hooks";
import { CartContext } from "../../context/CartContext";
import { DISH_TYPES } from "../../lib/constants";
import type { RootStackScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const { width } = Dimensions.get("window");
const IMG_HEIGHT = 380;

const DishDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"DishDetail">) => {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { dishId } = route.params;
  const { data: dish, isLoading, isError } = useDish(dishId);
  const { data: profile } = useProfile();
  const cartContext = useContext(CartContext);
  
  const scrollY = useRef(new Animated.Value(0)).current;

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
  
  // Check if current user is the chef of this dish
  const isOwnDish = profile?.user_id === (dish as any).chefId;

  const handleAddToCart = () => {
    if (isOwnDish) {
      Alert.alert("Недоступно", "Вы не можете заказать свои собственные блюда");
      return;
    }

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
        backgroundColor: c.primary, 
      });
    }
  };

  // Animations
  const imageScale = scrollY.interpolate({
    inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
    outputRange: [2, 1, 1],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
    outputRange: [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.7],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMG_HEIGHT * 0.6],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Parallax Image Background */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            height: IMG_HEIGHT,
            transform: [{ scale: imageScale }, { translateY: imageTranslateY }],
          },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: c.surface }]}>
             <Ionicons name="restaurant" size={80} color={c.textMuted} />
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.imageGradient}
        />
      </Animated.View>

      {/* Floating Header (Back Button) */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.roundBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Optional Share/Heart button */}
        <TouchableOpacity
          style={[styles.roundBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
        >
          <Ionicons name="heart-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Sticky Top Bar Background (appears on scroll) */}
      <Animated.View
         style={[
           styles.stickyHeaderDetails,
           { 
             height: insets.top + 60,
             paddingTop: insets.top,
             backgroundColor: c.background,
             opacity: headerOpacity,
             borderBottomWidth: 1,
             borderBottomColor: c.border
           }
         ]}
      >
        <Text style={[styles.stickyHeaderTitle, { color: c.text }]} numberOfLines={1}>
          {dish.name}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: IMG_HEIGHT - 30, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={[styles.contentContainer, { backgroundColor: c.background }]}>
          {/* Handle Indicator */}
          <View style={[styles.indicator, { backgroundColor: c.border }]} />

          <View style={styles.headerRow}>
             <View style={{ flex: 1 }}>
                <Text style={[styles.dishType, { color: c.primary }]}>
                  {DISH_TYPES[dish.type as keyof typeof DISH_TYPES] || dish.type}
                </Text>
                <Text style={[styles.dishName, { color: c.text }]}>{dish.name}</Text>
             </View>
             <Text style={[styles.priceTag, { color: c.primary }]}>
                {dish.price.toLocaleString()} ₸
             </Text>
          </View>

          {/* Stats / Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.infoBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
               <Ionicons name="time-outline" size={16} color={c.textSecondary} style={{ marginRight: 6 }} />
               <Text style={{ color: c.textSecondary, fontWeight: "600" }}>
                 {dish.time || "20-30"} мин
               </Text>
            </View>

            {dish.is_spicy && (
               <View style={[styles.infoBadge, { backgroundColor: "#FF3B3020", borderColor: "#FF3B3050" }]}>
                  <Ionicons name="flame" size={16} color="#FF3B30" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#FF3B30", fontWeight: "600" }}>Острое</Text>
               </View>
            )}

            {!isAvailable && (
               <View style={[styles.infoBadge, { backgroundColor: "#FF3B3020", borderColor: "#FF3B3050" }]}>
                  <Text style={{ color: "#FF3B30", fontWeight: "600" }}>Нет в наличии</Text>
               </View>
            )}
            
            {/* Rating Placeholder - could be real if dish has rating */}
            <View style={[styles.infoBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
               <Ionicons name="star" size={16} color="#FFD700" style={{ marginRight: 6 }} />
               <Text style={{ color: c.text, fontWeight: "600" }}>4.8</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          {/* Description */}
          {dish.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Описание</Text>
              <Text style={[styles.description, { color: c.textSecondary }]}>
                {dish.description}
              </Text>
            </View>
          ) : null}

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Ингредиенты</Text>
            <View style={styles.ingredientsContainer}>
               <Text style={[styles.description, { color: c.textSecondary }]}>
                  {dish.ingredients}
               </Text>
            </View>
          </View>

        </View>
      </Animated.ScrollView>

      {/* Footer Action */}
      <LinearGradient
        colors={[
            c.background === '#000000' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)', 
            c.background
        ]}
        style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
      >
        <Button
          title={isAvailable ? `В корзину • ${dish.price} ₸` : "Недоступно"}
          onPress={handleAddToCart}
          disabled={!isAvailable}
          fullWidth
          size="lg"
          style={{ 
            shadowColor: c.primary, 
            shadowOpacity: 0.3, 
            shadowRadius: 10, 
            shadowOffset: { width: 0, height: 4 },
            elevation: 8 
          }}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: width,
    zIndex: 0,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    // backdropFilter removed as it is web-only
  },
  stickyHeaderDetails: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: 800,
  },
  indicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
    opacity: 0.5,
  },
  headerRow: {
    marginBottom: 20,
  },
  dishType: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 1,
  },
  dishName: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 34,
  },
  priceTag: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 24,
    opacity: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
  },
  ingredientsContainer: {
    backgroundColor: "transparent",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default DishDetailScreen;
