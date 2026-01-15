/**
 * Chef Detail Screen - Enhanced with Video/Dish Toggle
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Avatar, StarRating, Spinner, Card } from "../../components/ui";
import { useChef, useChefDishes, useVideosByAuthor, useProfile } from "../../lib/hooks";
import { useFollowStats, useIsFollowing, useFollowUser } from "../../lib/hooks/useFollows";
import { useChefReviews, useCreateReview } from "../../lib/hooks/useReviews";
import ReviewModal from "../../components/ReviewModal";
import { showMessage } from "react-native-flash-message";
import { API_BASE_URL } from "../../lib/constants";
import type { RootStackScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const { width } = Dimensions.get("window");
const VIDEO_SIZE = (width - 4) / 3; // 3 columns
const VIDEO_HEIGHT = VIDEO_SIZE * 1.33; // 4:5 aspect ratio - taller videos

type TabType = "dishes" | "videos" | "reviews";

const ChefDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"ChefDetail">) => {
  const c = useColors();
  const { t } = useTranslation();
  const { chefId } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>("dishes");
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const { data: profile } = useProfile();
  const { data: chef, isLoading: isLoadingChef } = useChef(chefId);
  const { data: dishesData, isLoading: isLoadingDishes } = useChefDishes(chefId);

  const dishes = dishesData?.data ?? [];
 
  // Fetch chef's videos from API
  const { data: videosData } = useVideosByAuthor(chef?.users?.user_id);
  const videos = videosData?.pages.flatMap((page) => page.items) ?? [];

  // Fetch reviews
  const { data: reviews = [] } = useChefReviews(chefId);

  // Follow functionality
  const userId = chef?.users?.user_id;
  const { data: followStatsData } = useFollowStats(userId);
  const { data: isFollowingData } = useIsFollowing(userId);
  const { follow, unfollow, isLoading: isFollowLoading } = useFollowUser();
  
  // Review mutation
  const createReviewMutation = useCreateReview();

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!profile?.user_id) return;

    try {
      await createReviewMutation.mutateAsync({
        userId: profile.user_id,
        chefId,
        rating,
        comment,
      });
      setReviewModalVisible(false);
      showMessage({
        message: t('common.success'),
        description: t('profile.reviewSent'),
        type: "success",
        icon: "success",
      });
    } catch (error) {
      showMessage({
        message: t('common.error'),
        description: t('profile.reviewError'),
        type: "danger",
        icon: "danger",
      });
    }
  };

  const followStats = followStatsData?.data;
  const isFollowing = isFollowingData?.data?.isFollowing ?? false;
  const isOwnProfile = profile?.user_id === userId;

  if (isLoadingChef) return <Spinner fullScreen />;

  if (!chef) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.textSecondary }]}>
          {t('chef.notFound')}
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
              {chef.users?.name || t('profile.chef')}
            </Text>
            <StarRating rating={chef.rating} size={18} />
            {chef.users?.phone_number && (
              <Text style={[styles.phone, { color: c.textSecondary }]}>
                {chef.users.phone_number}
              </Text>
            )}
          </View>
        </View>

        {/* Instagram-style Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statCount, { color: c.text }]}>{dishes.length}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('profile.dishes')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statCount, { color: c.text }]}>
              {followStats?.followersCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('profile.followers')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statCount, { color: c.text }]}>
              {followStats?.followingCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('profile.following')}</Text>
          </View>
        </View>

        {/* Action Buttons Row - Follow + Review */}
        {!isOwnProfile && userId && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.followButton,
                {
                  backgroundColor: isFollowing ? c.surface : c.primary,
                  borderColor: isFollowing ? c.border : c.primary,
                },
              ]}
              onPress={() => {
                if (isFollowing) {
                  unfollow(userId, {
                    onError: (error: any) => {
                      showMessage({
                        message: "Ошибка",
                        description: error?.response?.status === 401 
                          ? t('common.sessionExpired')
                          : t('common.unfollowError'),
                        type: "danger",
                        icon: "danger",
                      });
                    },
                  });
                } else {
                  follow(userId, {
                    onError: (error: any) => {
                      showMessage({
                        message: "Ошибка",
                        description: error?.response?.status === 401 
                          ? t('common.sessionExpired')
                          : t('common.followError'),
                        type: "danger",
                        icon: "danger",
                      });
                    },
                  });
                }
              }}
              disabled={isFollowLoading}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFollowing ? "person-remove" : "person-add"}
                size={18}
                color={isFollowing ? c.text : "#fff"}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: isFollowing ? c.text : "#fff" },
                ]}
              >
                {isFollowing ? t('profile.unfollow') : t('profile.follow')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.reviewButton,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
              onPress={() => setReviewModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="star" size={18} color={c.primary} />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: c.text },
                ]}
              >
                {t('profile.leaveReview')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {/* Tab Switcher - Icon Only */}
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
            name="grid"
            size={24}
            color={activeTab === "dishes" ? c.primary : c.textMuted}
          />
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
            name="play-circle"
            size={24}
            color={activeTab === "videos" ? c.primary : c.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "reviews" && { borderBottomColor: c.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => setActiveTab("reviews")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="star"
            size={24}
            color={activeTab === "reviews" ? c.primary : c.textMuted}
          />
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
                {t('chef.noDishes')}
              </Text>
            </View>
          )}
        </View>
      ) : activeTab === "videos" ? (
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
                  {t('chef.noVideos')}
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        // Reviews List
        <View style={[styles.contentSection, { paddingHorizontal: 16 }]}>
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
              <View
                key={review.review_id}
                style={[styles.reviewCard, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <View style={styles.reviewHeader}>
                  <Avatar
                    uri={review.users?.profile_pic}
                    name={review.users?.name}
                    size="sm"
                  />
                  <View style={styles.reviewHeaderInfo}>
                    <Text style={[styles.reviewName, { color: c.text }]}>
                      {review.users?.name || t('common.user')}
                    </Text>
                    <StarRating rating={Number(review.rating)} size={14} />
                  </View>
                  <Text style={[styles.reviewDate, { color: c.textMuted }]}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={[styles.reviewComment, { color: c.textSecondary }]}>
                    {review.comment}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={48} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                {t('profile.noReviews')}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.bottomPadding} />

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        isLoading={createReviewMutation.isPending}
        chefName={chef?.users?.name}
      />
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

  // Instagram-style Stats Row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },

  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  followButton: {
    // Inherits from actionButton
  },
  reviewButton: {
    // Inherits from actionButton
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
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

  // Review Styles
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
  reviewHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },

  bottomPadding: { height: 32 },
});
