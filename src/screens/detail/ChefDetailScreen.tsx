/**
 * Chef Detail Screen - Enhanced with Video/Dish Toggle
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, StarRating, Spinner, Card } from "../../components/ui";
import { useChef, useChefDishes, useVideosByAuthor } from "../../lib/hooks";
import { API_BASE_URL } from "../../lib/constants";
import type { RootStackScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const { width } = Dimensions.get("window");
const VIDEO_SIZE = (width - 4) / 3; // 3 columns
const VIDEO_HEIGHT = VIDEO_SIZE * 1.33; // 4:5 aspect ratio - taller videos

type TabType = "videos" | "dishes";

const ChefDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"ChefDetail">) => {
  const c = useColors();
  const { chefId } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>("dishes");

  const { data: chef, isLoading: isLoadingChef } = useChef(chefId);
  const { data: dishesData, isLoading: isLoadingDishes } = useChefDishes(chefId);

  const dishes = dishesData?.data ?? [];

  // Fetch chef's videos from API
  const { data: videosData } = useVideosByAuthor(chef?.users?.user_id);
  const videos = videosData?.pages.flatMap((page) => page.items) ?? [];

  if (isLoadingChef) return <Spinner fullScreen />;

  if (!chef) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.textSecondary }]}>
          Повар не найден
        </Text>
      </View>
    );
  }

  const avatarUri = chef.users?.profile_pic
    ? chef.users.profile_pic.startsWith("http")
      ? chef.users.profile_pic
      : `${API_BASE_URL}${chef.users.profile_pic}`
    : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <Avatar uri={avatarUri} name={chef.users?.name} size="xl" />
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: c.text }]}>
              {chef.users?.name || "Шеф-повар"}
            </Text>
            <StarRating rating={chef.rating} size={18} />
            {chef.users?.phone_number && (
              <Text style={[styles.phone, { color: c.textSecondary }]}>
                {chef.users.phone_number}
              </Text>
            )}
          </View>
        </View>

        {chef.bio ? (
          <Text
            style={[
              styles.bio,
              { color: c.textSecondary, borderTopColor: c.divider },
            ]}
          >
            {chef.bio}
          </Text>
        ) : null}
      </Card>

      {/* Tab Switcher */}
      <View style={[styles.tabSwitcher, { backgroundColor: c.surface, borderColor: c.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "dishes" && { borderBottomColor: c.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => setActiveTab("dishes")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="restaurant"
            size={20}
            color={activeTab === "dishes" ? c.primary : c.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "dishes" ? c.primary : c.textMuted },
            ]}
          >
            Блюда ({dishes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "videos" && { borderBottomColor: c.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => setActiveTab("videos")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="videocam"
            size={20}
            color={activeTab === "videos" ? c.primary : c.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "videos" ? c.primary : c.textMuted },
            ]}
          >
            Видео ({videos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "dishes" ? (
        // Dishes Grid
        <View style={styles.contentSection}>
          {isLoadingDishes ? (
            <Spinner />
          ) : dishes.length > 0 ? (
            <View style={styles.dishesGrid}>
              {dishes.map((dish: any) => (
                <TouchableOpacity
                  key={dish.dish_id}
                  style={[styles.dishCard, { backgroundColor: c.card, borderColor: c.border }]}
                  onPress={() =>
                    navigation.navigate("DishDetail", { dishId: dish.dish_id })
                  }
                  activeOpacity={0.8}
                >
                  {dish.picture ? (
                    <Image
                      source={{ uri: dish.picture }}
                      style={styles.dishImage}
                      resizeMode="cover"
                      onError={(e) => console.log('Image load error:', dish.picture, e.nativeEvent.error)}
                    />
                  ) : (
                    <View style={[styles.dishImagePlaceholder, { backgroundColor: c.surface }]}>
                      <Ionicons name="restaurant" size={28} color={c.textMuted} />
                    </View>
                  )}
                  <View style={styles.dishInfo}>
                    <Text style={[styles.dishName, { color: c.text }]} numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text style={[styles.dishPrice, { color: c.primary }]}>
                      {dish.price} ₸
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                Повар пока не добавил блюда
              </Text>
            </View>
          )}
        </View>
      ) : (
        // Videos Grid (Instagram-style)
        <View style={styles.contentSection}>
          <View style={styles.videoGrid}>
            {videos.length > 0 ? (
              videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate("VideoViewer", { video });
                  }}
                >
                  <Image
                    source={{ uri: video.posterUrl || video.url }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                  />
                  {/* Play icon overlay */}
                  <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={32} color="#fff" style={{ opacity: 0.9 }} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="videocam-outline" size={48} color={c.textMuted} />
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                  Повар пока не добавил видео
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

export default ChefDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },

  headerCard: { margin: 16 },
  header: { flexDirection: "row", alignItems: "center" },
  headerInfo: { flex: 1, marginLeft: 16 },

  name: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  phone: { fontSize: 14, marginTop: 8 },

  bio: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },

  tabSwitcher: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
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
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },

  contentSection: {
    // No horizontal padding for Instagram-style full-width grid
  },

  // Dishes Grid (2 columns)
  dishesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  dishCard: {
    width: (width - 44) / 2, // 2 columns with padding and gap
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: {
    width: "100%",
    height: 120,
  },
  dishImagePlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  dishInfo: {
    padding: 10,
  },
  dishName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 15,
    fontWeight: "800",
  },

  // Video Grid (3 columns, Instagram style)
  videoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
  },
  videoItem: {
    width: VIDEO_SIZE,
    height: VIDEO_HEIGHT,
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
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

  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },

  bottomPadding: { height: 32 },
});
