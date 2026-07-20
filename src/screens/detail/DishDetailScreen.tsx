/**
 * Dish Detail Screen (theme-aware)
 * Premium "Bomb" Design
 */

import React, { useRef, useState } from "react";
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
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { Button, Badge, Spinner, Avatar } from "../../components/ui";
import { useDish, useProfile, useCart } from "../../lib/hooks";
import {
  useIsFavorite,
  useToggleFavorite,
} from "../../lib/hooks/useFavorites";
import {
  useDishChefs,
  useUpsertDishOffer,
  useDeleteDishOffer,
} from "../../lib/hooks/useDishes";
import { useRequestNutrition } from "../../lib/hooks/useAiFeatures";
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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { dishId } = route.params;
  const { data: dish, isLoading, isError } = useDish(dishId);
  const { data: profile } = useProfile();
  const nutritionMutation = useRequestNutrition();
  const isOwner =
    !!dish && !!profile?.chefs?.some((ch) => ch.chef_id === dish.chefId);
  const { addItem } = useCart();

  // Кто готовит блюдо (офферы с ценами)
  const { data: offers } = useDishChefs(dishId);
  const upsertOffer = useUpsertDishOffer();
  const deleteOffer = useDeleteDishOffer();
  const [selectedChefId, setSelectedChefId] = useState<number | null>(null);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerPriceInput, setOfferPriceInput] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;

  // Избранное
  const { data: isFav = false } = useIsFavorite(dishId);
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(
      { dishId, isFavorite: isFav },
      {
        onSuccess: () => {
          showMessage({
            message: isFav
              ? t("dish.removedFromFavorites", "Удалено из избранного")
              : t("dish.addedToFavorites", "Добавлено в избранное"),
            type: "success",
            icon: "success",
          });
        },
        onError: () => {
          showMessage({
            message: t("common.error"),
            type: "danger",
            icon: "danger",
          });
        },
      },
    );
  };

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

  // Check if current user is the chef of this dish.
  // dish.chefId is chefs.chef_id, so compare against the profile's chef record.
  const myChefId = profile?.chefs?.[0]?.chef_id;

  // Выбранный повар-исполнитель: state → автор → первый открытый оффер
  const offerList = offers ?? [];
  const selectedOffer =
    offerList.find((o) => o.chef_id === selectedChefId && o.is_open) ??
    offerList.find((o) => o.is_author && o.is_open) ??
    offerList.find((o) => o.is_open) ??
    offerList.find((o) => o.is_author) ??
    null;
  const effectivePrice = selectedOffer?.price ?? Number(dish.price);
  // своё блюдо = я исполнитель выбранного оффера
  const isOwnDish =
    !!myChefId && (selectedOffer?.chef_id ?? dish.chefId) === myChefId;
  const myOffer = myChefId
    ? offerList.find((o) => o.chef_id === myChefId)
    : null;
  const isChefUser = !!myChefId;

  const handleAddToCart = () => {
    if (isOwnDish) {
      Alert.alert(
        t("common.error"),
        t("dish.cantOrderOwn", "You cannot order your own dishes"),
      );
      return;
    }

    if (!isAvailable) {
      Alert.alert(
        t("common.error"),
        t("dish.unavailable", "This dish is currently unavailable"),
      );
      return;
    }

    const result = addItem(
      dish,
      1,
      "",
      selectedOffer
        ? {
            chefId: selectedOffer.chef_id,
            chefName: selectedOffer.name ?? undefined,
            price: selectedOffer.price,
          }
        : undefined,
    );

    if (result.alreadyExists) {
      showMessage({
        message: t("feed.alreadyInCart", { dishName: dish.name }),
        description: t("feed.changeQuantityInCart"),
        type: "info",
        icon: "info",
      });
      return;
    }

    showMessage({
      message: "Добавлено в корзину",
      description: dish.name,
      type: "success",
      icon: "success",
      backgroundColor: c.primary,
    });
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

        {/* Favorite button */}
        <TouchableOpacity
          style={[styles.roundBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={24}
            color={isFav ? "#EF4444" : "#FFF"}
          />
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
            borderBottomColor: c.border,
          },
        ]}
      >
        <Text
          style={[styles.stickyHeaderTitle, { color: c.text }]}
          numberOfLines={1}
        >
          {dish.name}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: IMG_HEIGHT - 30,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View
          style={[styles.contentContainer, { backgroundColor: c.background }]}
        >
          {/* Handle Indicator */}
          <View style={[styles.indicator, { backgroundColor: c.border }]} />

          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dishType, { color: c.primary }]}>
                {DISH_TYPES[dish.type as keyof typeof DISH_TYPES] || dish.type}
              </Text>
              <Text style={[styles.dishName, { color: c.text }]}>
                {dish.name}
              </Text>
            </View>
            <Text style={[styles.priceTag, { color: c.primary }]}>
              {dish.price.toLocaleString()} ₸
            </Text>
          </View>

          {/* Stats / Badges */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.infoBadge,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={c.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: c.textSecondary, fontWeight: "600" }}>
                {dish.time || "20-30"} мин
              </Text>
            </View>

            {dish.is_spicy && (
              <View
                style={[
                  styles.infoBadge,
                  { backgroundColor: "#FF3B3020", borderColor: "#FF3B3050" },
                ]}
              >
                <Ionicons
                  name="flame"
                  size={16}
                  color="#FF3B30"
                  style={{ marginRight: 6 }}
                />
                <Text style={{ color: "#FF3B30", fontWeight: "600" }}>
                  Острое
                </Text>
              </View>
            )}

            {!isAvailable && (
              <View
                style={[
                  styles.infoBadge,
                  { backgroundColor: "#FF3B3020", borderColor: "#FF3B3050" },
                ]}
              >
                <Text style={{ color: "#FF3B30", fontWeight: "600" }}>
                  Нет в наличии
                </Text>
              </View>
            )}

            {/* Rating Placeholder - could be real if dish has rating */}
            <View
              style={[
                styles.infoBadge,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <Ionicons
                name="star"
                size={16}
                color="#FFD700"
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: c.text, fontWeight: "600" }}>4.8</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          {/* Description */}
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

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Ингредиенты
            </Text>
            <View style={styles.ingredientsContainer}>
              <Text style={[styles.description, { color: c.textSecondary }]}>
                {dish.ingredients}
              </Text>
            </View>
          </View>

          {/* Кто готовит: повара с их ценами */}
          {offerList.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                {t("dish.whoCooks")}
              </Text>
              {offerList.map((o) => {
                const isSelected = selectedOffer?.chef_id === o.chef_id;
                const isMe = o.chef_id === myChefId;
                const disabled = !o.is_open || isMe;
                return (
                  <TouchableOpacity
                    key={o.chef_id}
                    style={[
                      styles.offerRow,
                      {
                        backgroundColor: isSelected
                          ? c.primary + "12"
                          : c.card,
                        borderColor: isSelected ? c.primary : c.border,
                        opacity: disabled ? 0.55 : 1,
                      },
                    ]}
                    disabled={disabled}
                    onPress={() => setSelectedChefId(o.chef_id)}
                    activeOpacity={0.7}
                  >
                    <Avatar
                      uri={o.avatar ?? undefined}
                      name={o.name ?? "?"}
                      size="sm"
                    />
                    <View style={styles.offerInfo}>
                      <View style={styles.offerNameRow}>
                        <Text
                          style={[styles.offerName, { color: c.text }]}
                          numberOfLines={1}
                        >
                          {o.name}
                          {isMe ? ` (${t("dish.you")})` : ""}
                        </Text>
                        {o.is_author && (
                          <View
                            style={[
                              styles.authorPill,
                              { backgroundColor: c.pillBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.authorPillText,
                                { color: c.textSecondary },
                              ]}
                            >
                              {t("dish.author")}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.offerMetaRow}>
                        <Ionicons name="star" size={12} color="#f5a623" />
                        <Text
                          style={[
                            styles.offerMeta,
                            { color: c.textSecondary },
                          ]}
                        >
                          {o.rating.toFixed(1)}
                        </Text>
                        <View
                          style={[
                            styles.openDot,
                            {
                              backgroundColor: o.is_open
                                ? "#2ecc71"
                                : c.textMuted,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.offerMeta,
                            {
                              color: o.is_open ? "#2ecc71" : c.textMuted,
                            },
                          ]}
                        >
                          {o.is_open ? t("dish.openNow") : t("dish.closedNow")}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.offerPrice, { color: c.text }]}>
                      {o.price.toLocaleString()} ₸
                    </Text>
                    <Ionicons
                      name={
                        isSelected ? "radio-button-on" : "radio-button-off"
                      }
                      size={20}
                      color={isSelected ? c.primary : c.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}

              {/* Шеф (не готовящий это блюдо) может присоединиться со своей ценой */}
              {isChefUser && (!myOffer || !myOffer.is_open) && !isOwner && (
                <Button
                  title={t("dish.iAlsoCook")}
                  variant="outline"
                  onPress={() => {
                    setOfferPriceInput(String(effectivePrice));
                    setOfferModalVisible(true);
                  }}
                  fullWidth
                  style={{ marginTop: 8 }}
                />
              )}
              {isChefUser && myOffer?.is_open && (
                <View style={styles.myOfferActions}>
                  <Button
                    title={t("dish.changeMyPrice")}
                    variant="outline"
                    onPress={() => {
                      setOfferPriceInput(String(myOffer.price));
                      setOfferModalVisible(true);
                    }}
                    style={{ flex: 1 }}
                  />
                  {/* автор не может перестать готовить своё блюдо */}
                  {!isOwner && (
                    <Button
                      title={t("dish.stopCooking")}
                      variant="outline"
                      onPress={() =>
                        deleteOffer.mutate(
                          { dishId },
                          {
                            onSuccess: () =>
                              showMessage({
                                message: t("dish.offerRemoved"),
                                type: "info",
                              }),
                          },
                        )
                      }
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          {/* КБЖУ (оценка ИИ) */}
          {dish.nutrition ? (
            <View style={styles.section}>
              <View style={styles.nutritionTitleRow}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>
                  КБЖУ на порцию
                </Text>
                <View
                  style={[styles.aiBadge, { backgroundColor: c.primary + "15" }]}
                >
                  <Ionicons name="sparkles" size={12} color={c.primary} />
                  <Text style={[styles.aiBadgeText, { color: c.primary }]}>
                    ИИ-оценка
                  </Text>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                {[
                  { label: "ккал", value: dish.nutrition.calories },
                  { label: "белки", value: `${dish.nutrition.protein} г` },
                  { label: "жиры", value: `${dish.nutrition.fat} г` },
                  { label: "углеводы", value: `${dish.nutrition.carbs} г` },
                ].map((n) => (
                  <View
                    key={n.label}
                    style={[styles.nutritionChip, { backgroundColor: c.pillBg }]}
                  >
                    <Text style={[styles.nutritionValue, { color: c.text }]}>
                      {n.value}
                    </Text>
                    <Text
                      style={[styles.nutritionLabel, { color: c.textSecondary }]}
                    >
                      {n.label}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.nutritionDisclaimer, { color: c.textMuted }]}>
                ≈ Примерная оценка ИИ по названию и ингредиентам блюда.
                Точная граммовка не указывается, значения могут отличаться от
                фактических.
              </Text>
            </View>
          ) : isOwner ? (
            <View style={styles.section}>
              <Button
                title={
                  nutritionMutation.isPending
                    ? "Считаем КБЖУ..."
                    : dish.nutrition_status === "failed"
                      ? "Посчитать КБЖУ ещё раз"
                      : "Посчитать КБЖУ с ИИ"
                }
                variant="outline"
                onPress={() => nutritionMutation.mutate(dish.dish_id)}
                loading={nutritionMutation.isPending}
                fullWidth
              />
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Footer Action */}
      <LinearGradient
        colors={[
          c.background === "#000000" ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)",
          c.background,
        ]}
        style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
      >
        <Button
          title={
            isAvailable
              ? `В корзину • ${effectivePrice.toLocaleString()} ₸`
              : "Недоступно"
          }
          onPress={handleAddToCart}
          disabled={!isAvailable}
          fullWidth
          size="lg"
          style={{
            shadowColor: c.primary,
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        />
      </LinearGradient>

      {/* Модалка: моя цена на это блюдо */}
      <Modal
        visible={offerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>
              {t("dish.yourPriceTitle")}
            </Text>
            <Text style={[styles.modalSubtitle, { color: c.textSecondary }]}>
              {dish.name}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: c.text, borderColor: c.border, backgroundColor: c.background },
              ]}
              keyboardType="number-pad"
              value={offerPriceInput}
              onChangeText={setOfferPriceInput}
              placeholder="2500"
              placeholderTextColor={c.textMuted}
              autoFocus
            />
            <View style={styles.myOfferActions}>
              <Button
                title={t("common.cancel")}
                variant="outline"
                onPress={() => setOfferModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={t("common.save")}
                loading={upsertOffer.isPending}
                onPress={() => {
                  const price = Number(offerPriceInput);
                  if (!Number.isFinite(price) || price <= 0) return;
                  upsertOffer.mutate(
                    { dishId, price },
                    {
                      onSuccess: () => {
                        setOfferModalVisible(false);
                        showMessage({
                          message: t("dish.offerSaved"),
                          type: "success",
                        });
                      },
                      onError: (e: any) =>
                        showMessage({
                          message:
                            e?.response?.data?.message ?? t("common.error"),
                          type: "danger",
                        }),
                    },
                  );
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  nutritionRow: {
    flexDirection: "row",
    gap: 8,
  },
  nutritionChip: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 10,
  },
  nutritionValue: { fontSize: 15, fontWeight: "800" },
  nutritionLabel: { fontSize: 11, marginTop: 2 },
  nutritionDisclaimer: { fontSize: 12, lineHeight: 17, marginTop: 10 },
  nutritionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 12,
  },
  aiBadgeText: { fontSize: 11, fontWeight: "700" },
  // Кто готовит
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  offerInfo: { flex: 1 },
  offerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  offerName: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  authorPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  authorPillText: { fontSize: 10, fontWeight: "700" },
  offerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  offerMeta: { fontSize: 12, fontWeight: "600" },
  openDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 6 },
  offerPrice: { fontSize: 15, fontWeight: "800" },
  myOfferActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  // Модалка цены
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalSubtitle: { fontSize: 13, marginTop: 4, marginBottom: 14 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
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
