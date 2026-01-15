
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

import { Avatar, StarRating } from "../../components/ui";
import {
  useProfile,
  useChefDishes,
  useVideosByAuthor,
  useChefReviews,
  useChefStats,
} from "../../lib/hooks";
import { useChefByUserId } from "../../lib/hooks/useChefs";
import { API_BASE_URL } from "../../lib/constants";
import { useColors } from "../../lib/theme";

const { width } = Dimensions.get("window");
const VIDEO_SIZE = (width - 4) / 3; // 3 columns with 1px gaps
const VIDEO_HEIGHT = VIDEO_SIZE * 1.33; // 4:5 aspect ratio

type ChefTabType = "dishes" | "videos" | "reviews";
type CustomerTabType = "orders" | "favorites";
type ViewMode = "info" | "statistics";

export default function ProfileScreen({ navigation }: any) {
  const c = useColors();
  const { t } = useTranslation();

  const { data: profile } = useProfile();

  const [chefActiveTab, setChefActiveTab] = useState<ChefTabType>("dishes");
  const [customerActiveTab, setCustomerActiveTab] =
    useState<CustomerTabType>("orders");
  const [viewMode, setViewMode] = useState<ViewMode>("info");
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  // Animated values for FAB menu
  const fabRotation = useRef(new Animated.Value(0)).current;
  const menuItem1Anim = useRef(new Animated.Value(0)).current;
  const menuItem2Anim = useRef(new Animated.Value(0)).current;
  const menuItem3Anim = useRef(new Animated.Value(0)).current;

  // Animate FAB menu
useEffect(() => {
  if (fabMenuOpen) {
    // IMPORTANT: reset values so stagger always plays
    menuItem1Anim.stopAnimation();
    menuItem2Anim.stopAnimation();
    menuItem3Anim.stopAnimation();
    fabRotation.stopAnimation();

    menuItem1Anim.setValue(0);
    menuItem2Anim.setValue(0);
    menuItem3Anim.setValue(0);
    fabRotation.setValue(0);

    Animated.spring(fabRotation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    Animated.stagger(90, [
      Animated.spring(menuItem1Anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 55,
        friction: 8,
      }),
      Animated.spring(menuItem2Anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 55,
        friction: 8,
      }),
      Animated.spring(menuItem3Anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 55,
        friction: 8,
      }),
    ]).start();
  } else {
    // close animation (values still animate even if unmounted)
    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(menuItem1Anim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(menuItem2Anim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(menuItem3Anim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }
}, [fabMenuOpen, fabRotation, menuItem1Anim, menuItem2Anim, menuItem3Anim]);

  const avatarUri = profile?.profile_pic
    ? profile.profile_pic.startsWith("http")
      ? profile.profile_pic
      : `${API_BASE_URL}${profile.profile_pic}`
    : null;

  const roleIsChef = profile?.role === "chef";

  // Get chef info if user is a chef
  const { data: chef } = useChefByUserId(profile?.user_id);
  const chefId = chef?.chef_id;

  // Fetch real data from backend
  const { data: videosData } = useVideosByAuthor(profile?.user_id);
  const { data: dishesData } = useChefDishes(chefId);
  const { data: reviews = [] } = useChefReviews(chefId ?? 0);
  const { data: chefStats } = useChefStats(chefId);

  const videos = useMemo(
    () => videosData?.pages.flatMap((page) => page.items) ?? [],
    [videosData]
  );
  const dishes = dishesData?.data ?? [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("ru-RU").format(Math.round(value));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: c.card }]}>
          <View style={styles.centeredAvatarContainer}>
            <Avatar uri={avatarUri} name={profile?.name} size="xl" />
          </View>

          <Text style={[styles.centeredName, { color: c.text }]}>
            {profile?.name || t("common.user")}
          </Text>

          {!!profile?.email && (
            <Text style={[styles.centeredEmail, { color: c.textSecondary }]}>
              {profile.email}
            </Text>
          )}

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: c.primary + "15",
                borderColor: c.primary + "30",
              },
            ]}
          >
            <Ionicons
              name={roleIsChef ? "restaurant" : "person"}
              size={14}
              color={c.primary}
            />
            <Text style={[styles.roleText, { color: c.primary }]}>
              {roleIsChef ? t("profile.chef") : t("profile.customer")}
            </Text>
          </View>
        </View>

        {/* Top Stats Cards (single time only) */}
        <View style={styles.statsCards}>
          {roleIsChef ? (
            <>
              <View style={[styles.statCard, { backgroundColor: c.card }]}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#FF8C42" + "20" },
                  ]}
                >
                  <Ionicons name="restaurant" size={24} color="#FF8C42" />
                </View>
                <Text style={[styles.statCardCount, { color: c.text }]}>
                  {dishes.length}
                </Text>
                <Text style={[styles.statCardLabel, { color: c.textSecondary }]}>
                  {t("profile.dishes")}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: c.card }]}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#9C27B0" + "20" },
                  ]}
                >
                  <Ionicons name="videocam" size={24} color="#9C27B0" />
                </View>
                <Text style={[styles.statCardCount, { color: c.text }]}>
                  {videos.length}
                </Text>
                <Text style={[styles.statCardLabel, { color: c.textSecondary }]}>
                  {t("profile.videos")}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: c.card }]}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#FFD700" + "20" },
                  ]}
                >
                  <Ionicons name="star" size={24} color="#FFD700" />
                </View>
                <Text style={[styles.statCardCount, { color: c.text }]}>
                  {chef?.rating ? Number(chef.rating).toFixed(1) : "0.0"}
                </Text>
                <Text style={[styles.statCardLabel, { color: c.textSecondary }]}>
                  {t("chef.rating")}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.statCard, { backgroundColor: c.card }]}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#4CAF50" + "20" },
                  ]}
                >
                  <Ionicons name="receipt" size={24} color="#4CAF50" />
                </View>
                <Text style={[styles.statCardCount, { color: c.text }]}>0</Text>
                <Text style={[styles.statCardLabel, { color: c.textSecondary }]}>
                  {t("common.orders")}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: c.card }]}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#FF4458" + "20" },
                  ]}
                >
                  <Ionicons name="heart" size={24} color="#FF4458" />
                </View>
                <Text style={[styles.statCardCount, { color: c.text }]}>0</Text>
                <Text style={[styles.statCardLabel, { color: c.textSecondary }]}>
                  {t("common.favorites")}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: c.card }]}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#2196F3" + "20" },
                  ]}
                >
                  <Ionicons name="location" size={24} color="#2196F3" />
                </View>
                <Text style={[styles.statCardCount, { color: c.text }]}>0</Text>
                <Text style={[styles.statCardLabel, { color: c.textSecondary }]}>
                  {t("common.addresses")}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Chef Content */}
        {roleIsChef && (
          <View style={styles.chefContent}>
            {viewMode === "info" ? (
              <>
                {/* Tab Switcher */}
                <View style={styles.tabSwitcher}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      chefActiveTab === "dishes" && {
                        borderBottomColor: c.primary,
                        borderBottomWidth: 3,
                      },
                    ]}
                    onPress={() => setChefActiveTab("dishes")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="grid"
                      size={24}
                      color={chefActiveTab === "dishes" ? c.primary : c.textMuted}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      chefActiveTab === "videos" && {
                        borderBottomColor: c.primary,
                        borderBottomWidth: 3,
                      },
                    ]}
                    onPress={() => setChefActiveTab("videos")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="play-circle"
                      size={24}
                      color={chefActiveTab === "videos" ? c.primary : c.textMuted}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      chefActiveTab === "reviews" && {
                        borderBottomColor: c.primary,
                        borderBottomWidth: 3,
                      },
                    ]}
                    onPress={() => setChefActiveTab("reviews")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="star"
                      size={24}
                      color={chefActiveTab === "reviews" ? c.primary : c.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                {chefActiveTab === "dishes" ? (
                  <View style={styles.dishesGrid}>
                    {dishes.length > 0 ? (
                      dishes.map((dish: any) => (
                        <TouchableOpacity
                          key={dish.dish_id}
                          style={[
                            styles.dishCard,
                            {
                              backgroundColor: c.card,
                              borderColor: c.border,
                            },
                          ]}
                          activeOpacity={0.8}
                          onPress={() =>
                            navigation.navigate("DishDetail", {
                              dishId: dish.dish_id,
                            })
                          }
                        >
                          {dish.picture ? (
                            <Image
                              source={{ uri: dish.picture }}
                              style={styles.dishImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View
                              style={[
                                styles.dishImage,
                                {
                                  backgroundColor: c.surface,
                                  alignItems: "center",
                                  justifyContent: "center",
                                },
                              ]}
                            >
                              <Ionicons
                                name="restaurant"
                                size={28}
                                color={c.textMuted}
                              />
                            </View>
                          )}

                          <View style={styles.dishInfo}>
                            <Text
                              style={[styles.dishName, { color: c.text }]}
                              numberOfLines={1}
                            >
                              {dish.name}
                            </Text>
                            <Text style={[styles.dishPrice, { color: c.primary }]}>
                              {dish.price} ₸
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons
                          name="restaurant-outline"
                          size={48}
                          color={c.textMuted}
                        />
                        <Text
                          style={[
                            styles.emptyText,
                            { color: c.textSecondary },
                          ]}
                        >
                          {t("chef.noDishes")}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : chefActiveTab === "videos" ? (
                  <View style={styles.videoGrid}>
                    {videos.length > 0 ? (
                      videos.map((video: any) => (
                        <TouchableOpacity
                          key={video.id}
                          style={styles.videoItem}
                          activeOpacity={0.8}
                          onPress={() =>
                            navigation.navigate("VideoViewer", { video })
                          }
                        >
                          <Image
                            source={{ uri: video.posterUrl || video.url }}
                            style={styles.videoThumbnail}
                            resizeMode="cover"
                          />
                          <View style={styles.playOverlay}>
                            <Ionicons
                              name="play-circle"
                              size={32}
                              color="#fff"
                              style={{ opacity: 0.9 }}
                            />
                          </View>
                          <View style={styles.videoStatsOverlay}>
                            <Ionicons name="play" size={12} color="#fff" />
                            <Text style={styles.videoViewCount}>
                              {video.stats?.views >= 1000
                                ? `${(video.stats.views / 1000).toFixed(0)}k`
                                : video.stats?.views || 0}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons
                          name="videocam-outline"
                          size={48}
                          color={c.textMuted}
                        />
                        <Text
                          style={[
                            styles.emptyText,
                            { color: c.textSecondary },
                          ]}
                        >
                          {t("chef.noVideos")}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={[styles.reviewsContainer, { paddingHorizontal: 16 }]}>
                    {reviews.length > 0 ? (
                      reviews.map((review: any) => (
                        <View
                          key={review.review_id}
                          style={[
                            styles.reviewCard,
                            { backgroundColor: c.card, borderColor: c.border },
                          ]}
                        >
                          <View style={styles.reviewHeader}>
                            <Avatar
                              uri={review.users?.profile_pic}
                              name={review.users?.name}
                              size="sm"
                            />
                            <View style={styles.reviewHeaderInfo}>
                              <Text style={[styles.reviewName, { color: c.text }]}>
                                {review.users?.name || t("common.user")}
                              </Text>
                              <StarRating rating={Number(review.rating)} size={14} />
                            </View>
                            <Text style={[styles.reviewDate, { color: c.textMuted }]}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                          {!!review.comment && (
                            <Text
                              style={[
                                styles.reviewComment,
                                { color: c.textSecondary },
                              ]}
                            >
                              {review.comment}
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons name="star-outline" size={48} color={c.textMuted} />
                        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                          {t("profile.noReviews")}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            ) : (
              /* Statistics Mode */
              <View style={styles.premiumStatsSection}>
                {chefStats ? (
                  <>
                    <LinearGradient
                      colors={["#FF6B6B", "#FF8E53"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.earningsCard}
                    >
                      <View style={styles.earningsHeader}>
                        <Ionicons name="wallet" size={28} color="#fff" />
                        <Text style={styles.earningsLabel}>
                          {t("chef.stats.monthlyEarnings")}
                        </Text>
                      </View>

                      <Text style={styles.earningsValue}>
                        {formatCurrency(chefStats.monthlyEarnings)} ₸
                      </Text>

                      <View style={styles.earningsDivider} />

                      <View style={styles.earningsFooter}>
                        <View style={styles.earningsSubStat}>
                          <Ionicons
                            name="trending-up"
                            size={16}
                            color="rgba(255,255,255,0.9)"
                          />
                          <Text style={styles.earningsSubLabel}>
                            {formatCurrency(chefStats.totalRevenue)} ₸{" "}
                            {t("chef.stats.totalRevenue")}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                      <View style={[styles.miniStatCard, { backgroundColor: c.card }]}>
                        <View
                          style={[
                            styles.miniStatIconBox,
                            { backgroundColor: "#9C27B0" + "15" },
                          ]}
                        >
                          <Ionicons name="play-circle" size={20} color="#9C27B0" />
                        </View>
                        <Text style={[styles.miniStatValue, { color: c.text }]}>
                          {chefStats.videoOrdersCount}
                        </Text>
                        <Text style={[styles.miniStatLabel, { color: c.textSecondary }]}>
                          {t("chef.stats.videoOrders")}
                        </Text>
                      </View>

                      <View style={[styles.miniStatCard, { backgroundColor: c.card }]}>
                        <View
                          style={[
                            styles.miniStatIconBox,
                            { backgroundColor: "#4CAF50" + "15" },
                          ]}
                        >
                          <Ionicons name="receipt" size={20} color="#4CAF50" />
                        </View>
                        <Text style={[styles.miniStatValue, { color: c.text }]}>
                          {chefStats.totalOrders}
                        </Text>
                        <Text style={[styles.miniStatLabel, { color: c.textSecondary }]}>
                          {t("chef.stats.totalOrders")}
                        </Text>
                      </View>

                      <View style={[styles.miniStatCard, { backgroundColor: c.card }]}>
                        <View
                          style={[
                            styles.miniStatIconBox,
                            { backgroundColor: "#FFD700" + "15" },
                          ]}
                        >
                          <Ionicons name="star" size={20} color="#FFD700" />
                        </View>
                        <Text style={[styles.miniStatValue, { color: c.text }]}>
                          {chef?.rating ? Number(chef.rating).toFixed(1) : "0.0"}
                        </Text>
                        <Text style={[styles.miniStatLabel, { color: c.textSecondary }]}>
                          {t("chef.rating")}
                        </Text>
                      </View>

                      <View style={[styles.miniStatCard, { backgroundColor: c.card }]}>
                        <View
                          style={[
                            styles.miniStatIconBox,
                            { backgroundColor: "#2196F3" + "15" },
                          ]}
                        >
                          <Ionicons name="cash" size={20} color="#2196F3" />
                        </View>
                        <Text style={[styles.miniStatValue, { color: c.text }]}>
                          {formatCurrency(chefStats.averageOrderValue)} ₸
                        </Text>
                        <Text style={[styles.miniStatLabel, { color: c.textSecondary }]}>
                          {t("chef.stats.avgOrderValue")}
                        </Text>
                      </View>
                    </View>

                    {/* Top Dishes */}
                    {chefStats.topDishesThisWeek?.length > 0 && (
                      <View style={styles.topDishesSection}>
                        <View style={[styles.topDishesHeader, { paddingHorizontal: 16 }]}>
                          <Ionicons name="flame" size={24} color="#FF6B6B" />
                          <Text style={[styles.topDishesTitle, { color: c.text }]}>
                            {t("chef.stats.topDishes")}
                          </Text>
                        </View>

                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.topDishesScroll}
                        >
                          {chefStats.topDishesThisWeek.map((dish: any, index: number) => (
                            <TouchableOpacity
                              key={dish.dish_id}
                              style={[styles.topDishCard, { backgroundColor: c.card }]}
                              activeOpacity={0.8}
                              onPress={() =>
                                navigation.navigate("DishDetail", { dishId: dish.dish_id })
                              }
                            >
                              <View
                                style={[
                                  styles.rankBadge,
                                  {
                                    backgroundColor:
                                      index === 0
                                        ? "#FFD700"
                                        : index === 1
                                        ? "#C0C0C0"
                                        : "#CD7F32",
                                  },
                                ]}
                              >
                                <Text style={styles.rankText}>{index + 1}</Text>
                              </View>

                              {dish.picture ? (
                                <Image
                                  source={{ uri: dish.picture }}
                                  style={styles.topDishImage}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.topDishImage,
                                    {
                                      backgroundColor: c.surface,
                                      alignItems: "center",
                                      justifyContent: "center",
                                    },
                                  ]}
                                >
                                  <Ionicons name="restaurant" size={32} color={c.textMuted} />
                                </View>
                              )}

                              <View style={styles.topDishInfo}>
                                <Text
                                  style={[styles.topDishName, { color: c.text }]}
                                  numberOfLines={1}
                                >
                                  {dish.name}
                                </Text>

                                <View style={styles.topDishStats}>
                                  <View style={styles.topDishStatItem}>
                                    <Ionicons name="cart" size={14} color="#4CAF50" />
                                    <Text
                                      style={[
                                        styles.topDishStatText,
                                        { color: c.textSecondary },
                                      ]}
                                    >
                                      {dish.ordersThisWeek} {t("chef.stats.ordersThisWeek")}
                                    </Text>
                                  </View>

                                  <View style={styles.topDishStatItem}>
                                    <Ionicons name="cash" size={14} color="#2196F3" />
                                    <Text
                                      style={[
                                        styles.topDishStatText,
                                        { color: c.textSecondary },
                                      ]}
                                    >
                                      {formatCurrency(dish.revenueThisWeek)} ₸
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="stats-chart-outline" size={48} color={c.textMuted} />
                    <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                      {t("profile.statsUnavailable")}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Customer Content */}
        {!roleIsChef && (
          <View style={styles.customerContent}>
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  customerActiveTab === "orders" && {
                    borderBottomColor: c.primary,
                    borderBottomWidth: 3,
                  },
                ]}
                onPress={() => setCustomerActiveTab("orders")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="receipt"
                  size={24}
                  color={customerActiveTab === "orders" ? c.primary : c.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  customerActiveTab === "favorites" && {
                    borderBottomColor: c.primary,
                    borderBottomWidth: 3,
                  },
                ]}
                onPress={() => setCustomerActiveTab("favorites")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="heart"
                  size={24}
                  color={
                    customerActiveTab === "favorites" ? c.primary : c.textMuted
                  }
                />
              </TouchableOpacity>
            </View>

            {customerActiveTab === "orders" ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color={c.textMuted} />
                <Text style={[styles.emptyTitle, { color: c.text }]}>
                  {t("profile.ordersEmpty")}
                </Text>
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                  {t("profile.startOrdering")}
                </Text>
                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: c.primary }]}
                  onPress={() => navigation.navigate("Search")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ctaButtonText}>
                    {t("profile.findDishes")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color={c.textMuted} />
                <Text style={[styles.emptyTitle, { color: c.text }]}>
                  {t("profile.noFavorites")}
                </Text>
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                  {t("profile.addFavorites")}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button for Chefs */}
      {/* FAB Arc Menu for Chef */}
      {roleIsChef && (
        <>
          {/* Backdrop */}
          {fabMenuOpen && (
            <TouchableOpacity
              style={styles.fabBackdrop}
              activeOpacity={1}
              onPress={() => setFabMenuOpen(false)}
            />
          )}

          {/* Arc Menu Options */}
{/* Arc Menu Options */}
{fabMenuOpen && (
  <View style={styles.arcMenuContainer} pointerEvents="box-none">
    {/* Item 1 */}
    <Animated.View
      style={[
        styles.arcMenuItemWrapper,
        {
          transform: [
            {
              translateX: menuItem1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -132],
              }),
            },
            {
              translateY: menuItem1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -18],
              }),
            },
            {
              scale: menuItem1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.65, 1],
              }),
            },
          ],
          opacity: menuItem1Anim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.arcMenuPill,
          {
            backgroundColor: c.name === "dark" ? "rgba(255,255,255,0.08)" : "#FFFFFF",
            borderColor: c.border,
          },
        ]}
        onPress={() => {
          setViewMode(viewMode === "info" ? "statistics" : "info");
          setFabMenuOpen(false);
        }}
        activeOpacity={0.86}
      >
        <View
          style={[
            styles.arcMenuIconBubble,
            { backgroundColor: c.primary + "18", borderColor: c.primary + "30" },
          ]}
        >
          <Ionicons
            name={viewMode === "info" ? "stats-chart" : "information-circle"}
            size={18}
            color={c.primary}
          />
        </View>

        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      </TouchableOpacity>
    </Animated.View>

    {/* Item 2 */}
    <Animated.View
      style={[
        styles.arcMenuItemWrapper,
        {
          transform: [
            {
              translateX: menuItem2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -96],
              }),
            },
            {
              translateY: menuItem2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -88],
              }),
            },
            {
              scale: menuItem2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.65, 1],
              }),
            },
          ],
          opacity: menuItem2Anim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.arcMenuPill,
          {
            backgroundColor: c.name === "dark" ? "rgba(255,255,255,0.08)" : "#FFFFFF",
            borderColor: c.border,
          },
        ]}
        onPress={() => {
          setFabMenuOpen(false);
          navigation.navigate("AddDish");
        }}
        activeOpacity={0.86}
      >
        <View
          style={[
            styles.arcMenuIconBubble,
            { backgroundColor: "#22C55E" + "18", borderColor: "#22C55E" + "30" },
          ]}
        >
          <Ionicons name="restaurant" size={18} color="#22C55E" />
        </View>

        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      </TouchableOpacity>
    </Animated.View>

    {/* Item 3 */}
    <Animated.View
      style={[
        styles.arcMenuItemWrapper,
        {
          transform: [
            {
              translateX: menuItem3Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -54],   // чуть левее
              }),
            },
            {
              translateY: menuItem3Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -156],  // выше
              }),
            },
            {
              scale: menuItem3Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.65, 1],
              }),
            },
          ],
          opacity: menuItem3Anim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.arcMenuPill,
          {
            backgroundColor: c.name === "dark" ? "rgba(255,255,255,0.08)" : "#FFFFFF",
            borderColor: c.border,
          },
        ]}
        onPress={() => {
          setFabMenuOpen(false);
          navigation.navigate("AddVideo");
        }}
        activeOpacity={0.86}
      >
        <View
          style={[
            styles.arcMenuIconBubble,
            { backgroundColor: "#06B6D4" + "18", borderColor: "#06B6D4" + "30" },
          ]}
        >
          <Ionicons name="videocam" size={18} color="#06B6D4" />
        </View>


        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  </View>
)}

          {/* Main FAB Button */}
          <Animated.View
            style={[
              styles.fab,
              { backgroundColor: c.primary },
              {
                transform: [
                  {
                    rotate: fabRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "45deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.fabInner}
              onPress={() => setFabMenuOpen(!fabMenuOpen)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Profile Header
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  centeredAvatarContainer: { alignItems: "center", marginBottom: 16 },
  centeredName: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  centeredEmail: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 12,
    gap: 6,
  },
  roleText: { fontSize: 13, fontWeight: "700" },

  // Stats Cards
  statsCards: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statCardCount: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  statCardLabel: { fontSize: 12, textAlign: "center" },

  // Chef / Customer Content
  chefContent: {},
  customerContent: {},

  // Main Section Switcher
  mainSectionSwitcher: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginHorizontal: 16,
    borderBottomWidth: 1,
  },
  mainSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
    gap: 8,
  },
  mainSectionText: { fontSize: 16, fontWeight: "700" },

  // Tabs (no ugly border frame)
  tabSwitcher: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },

  // Dishes
  dishesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dishCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: { width: "100%", height: 120 },
  dishInfo: { padding: 10 },
  dishName: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  dishPrice: { fontSize: 15, fontWeight: "800" },

  // Videos grid
  videoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 1 },
  videoItem: { width: VIDEO_SIZE, height: VIDEO_HEIGHT, position: "relative" },
  videoThumbnail: { width: "100%", height: "100%" },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  videoStatsOverlay: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
  },
  videoViewCount: { color: "#fff", fontSize: 11, fontWeight: "600" },

  // Reviews
  reviewsContainer: {},
  reviewCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewHeaderInfo: { flex: 1, marginLeft: 12 },
  reviewName: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  reviewDate: { fontSize: 12 },
  reviewComment: { fontSize: 14, lineHeight: 20 },

  // Empty / CTA
  emptyState: { alignItems: "center", paddingVertical: 64, paddingHorizontal: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: { fontSize: 14, marginTop: 8, textAlign: "center" },
  ctaButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 14 },
  ctaButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  bottomPadding: { height: 32 },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Statistics Section
  premiumStatsSection: { paddingTop: 8, paddingBottom: 8 },

  earningsCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  earningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  earningsLabel: { color: "#fff", fontSize: 16, fontWeight: "600", opacity: 0.95 },
  earningsValue: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 16,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  earningsFooter: { flexDirection: "row", justifyContent: "space-between" },
  earningsSubStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  earningsSubLabel: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  miniStatCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  miniStatIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  miniStatValue: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  miniStatLabel: { fontSize: 11, textAlign: "center" },

  topDishesSection: { marginBottom: 12 },
  topDishesHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  topDishesTitle: { fontSize: 20, fontWeight: "800" },
  topDishesScroll: { paddingLeft: 16, paddingRight: 16 },
  topDishCard: {
    width: 160,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rankText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  topDishImage: { width: "100%", height: 120 },
  topDishInfo: { padding: 12 },
  topDishName: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  topDishStats: { gap: 6 },
  topDishStatItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  topDishStatText: { fontSize: 11, fontWeight: "600" },

  // FAB Arc Menu

  // FAB Arc Menu
fabBackdrop: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.35)",
},
arcMenuContainer: {
  position: "absolute",
  right: 20,
  bottom: 24, // привязка к FAB, а не к "90"
  width: 220,
  height: 220,
},
arcMenuItemWrapper: {
  position: "absolute",
  right: 0,
  bottom: 0,
},
arcMenuPill: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 999, // супер-изогнутая
  borderWidth: 1,
  minWidth: 60,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.14,
  shadowRadius: 18,
  elevation: 10,
},
arcMenuIconBubble: {
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
},
arcMenuText: {
  flex: 1,
  fontSize: 14,
  fontWeight: "800",
},
fabInner: {
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
},

});
