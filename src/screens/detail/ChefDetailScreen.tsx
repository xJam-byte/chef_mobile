import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Avatar, StarRating, Spinner, ReportModal } from "../../components/ui";
import VideoThumbnail from "../../components/video/VideoThumbnail";
import { PremiumHeader } from "../../components/ui/PremiumHeader";
import {
  useChef,
  useChefDishes,
  useVideosByAuthor,
  useProfile,
  useBlockUser,
  useUnblockUser,
  useBlockedUsers,
} from "../../lib/hooks";
import {
  useFollowStats,
  useIsFollowing,
  useFollowUser,
} from "../../lib/hooks/useFollows";
import { useChefReviews, useCreateReview } from "../../lib/hooks/useReviews";
import ReviewModal from "../../components/ReviewModal";
import { showMessage } from "react-native-flash-message";
import { API_BASE_URL } from "../../lib/constants";
import type { RootStackScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const { width } = Dimensions.get("window");

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
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const { data: profile } = useProfile();
  const { data: chef, isLoading: isLoadingChef } = useChef(chefId);
  const { data: dishesData, isLoading: isLoadingDishes } =
    useChefDishes(chefId);

  const dishes = dishesData?.data ?? [];

  // Fetch chef's videos from API
  const { data: videosData } = useVideosByAuthor(chef?.users?.user_id);
  const videos = useMemo(
    () => videosData?.pages.flatMap((page) => page.items) ?? [],
    [videosData],
  );

  // Fetch reviews
  const { data: reviews = [] } = useChefReviews(chefId);

  // Follow functionality
  const targetUserId = chef?.users?.user_id;
  const { data: followStatsData } = useFollowStats(targetUserId);
  const { data: isFollowingData } = useIsFollowing(targetUserId);
  const { follow, unfollow, isLoading: isFollowLoading } = useFollowUser();

  // Safety
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();
  const { data: blockedUsers } = useBlockedUsers();
  const isBlocked = useMemo(() => {
    return blockedUsers?.some((b: any) => b.blocked.user_id === targetUserId);
  }, [blockedUsers, targetUserId]);

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
        message: t("common.success"),
        description: t("profile.reviewSent"),
        type: "success",
        icon: "success",
      });
    } catch (error) {
      showMessage({
        message: t("common.error"),
        description: t("profile.reviewError"),
        type: "danger",
        icon: "danger",
      });
    }
  };

  const handleOptionsPress = () => {
    if (!profile || !targetUserId) return;

    const options = [
      t("common.cancel", "Cancel"),
      t("common.report", "Report User"),
      isBlocked
        ? t("common.unblock", "Unblock User")
        : t("common.block", "Block User"),
    ];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 0;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setReportModalVisible(true);
          } else if (buttonIndex === 2) {
            handleBlockToggle();
          }
        },
      );
    } else {
      Alert.alert(t("common.options", "Options"), undefined, [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.report"),
          onPress: () => setReportModalVisible(true),
        },
        {
          text: isBlocked ? t("common.unblock") : t("common.block"),
          style: "destructive",
          onPress: handleBlockToggle,
        },
      ]);
    }
  };

  const handleBlockToggle = () => {
    if (!targetUserId) return;

    if (isBlocked) {
      unblockUserMutation.mutate(targetUserId);
    } else {
      Alert.alert(
        t("common.blockConfirmTitle", "Block User?"),
        t(
          "common.blockConfirmMessage",
          "They will not be able to message you or see your posts.",
        ),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.block"),
            style: "destructive",
            onPress: () =>
              blockUserMutation.mutate({ blockedId: targetUserId }),
          },
        ],
      );
    }
  };

  const followStats = followStatsData?.data;
  const isFollowing = isFollowingData?.data?.isFollowing ?? false;
  const isOwnProfile = profile?.user_id === targetUserId;
  const subscribers = followStats?.followersCount || 0;

  if (isLoadingChef) return <Spinner fullScreen />;

  if (!chef) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.textSecondary }]}>
          {t("chef.notFound")}
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
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Premium Header */}
      <PremiumHeader
        title={t("chef.detailsTitle", "Chef Profile")}
        backButton
        rightElement={
          !isOwnProfile ? (
            <TouchableOpacity onPress={handleOptionsPress}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
            </TouchableOpacity>
          ) : undefined
        }
      >
        <View style={styles.profileInfoRow}>
          <View style={styles.avatarContainer}>
            <Avatar uri={avatarUri} name={chef.users?.name} size="lg" />
            <View
              style={[
                styles.chefBadge,
                { backgroundColor: c.primary, borderColor: c.surface },
              ]}
            >
              <Ionicons name="star" size={12} color="#fff" />
            </View>
          </View>

          <View style={styles.profileTexts}>
            <Text style={[styles.name, { color: "#FFF" }]}>
              {chef.users?.name || t("profile.chef")}
            </Text>
            <Text style={[styles.handle, { color: "rgba(255,255,255,0.7)" }]}>
              @
              {(chef.users as any)?.username ||
                chef.users?.name?.replace(/\s/g, "").toLowerCase()}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F97316" />
              <Text style={[styles.ratingText, { color: "#FFF" }]}>
                {chef.rating || "5.0"}
              </Text>
              <Text style={[styles.dotSep, { color: "rgba(255,255,255,0.5)" }]}>
                •
              </Text>
              <Text
                style={[styles.ordersText, { color: "rgba(255,255,255,0.7)" }]}
              >
                {dishes.length * 12} {t("chef.stats.totalOrders")}
              </Text>
            </View>
          </View>
        </View>
      </PremiumHeader>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statItem, { borderColor: c.border }]}>
          <Text style={[styles.statValue, { color: c.text }]}>
            {videos.length}
          </Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>
            {t("profile.videos")}
          </Text>
        </View>
        <View
          style={[
            styles.statItem,
            { borderColor: c.border, borderLeftWidth: 1, borderRightWidth: 1 },
          ]}
        >
          <Text style={[styles.statValue, { color: c.text }]}>
            {subscribers >= 1000
              ? (subscribers / 1000).toFixed(1) + "K"
              : subscribers}
          </Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>
            {t("profile.followers")}
          </Text>
        </View>
        <View style={[styles.statItem, { borderColor: c.border }]}>
          <Text style={[styles.statValue, { color: c.text }]}>
            {dishes.length}
          </Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>
            {t("profile.dishes")}
          </Text>
        </View>
      </View>

      {/* Action Buttons Row - Follow + Review */}
      {!isOwnProfile && targetUserId && (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.largeActionButton,
              {
                backgroundColor: isFollowing ? c.card : "#F97316",
                flex: 1,
              },
            ]}
            onPress={() => {
              if (isFollowing) {
                unfollow(targetUserId, {
                  onError: (error: any) => {
                    // Error handling
                  },
                });
              } else {
                follow(targetUserId, {
                  onError: (error: any) => {
                    // Error handling
                  },
                });
              }
            }}
            disabled={isFollowLoading}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: isFollowing ? c.text : "#fff" },
              ]}
            >
              {isFollowing ? t("profile.unfollow") : t("profile.follow")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.largeActionButton,
              { backgroundColor: c.card, flex: 1 },
            ]}
            onPress={() => setReviewModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: c.text }]}>
              {t("profile.leaveReview")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.textTab,
            activeTab === "dishes" && { backgroundColor: c.card },
          ]}
          onPress={() => setActiveTab("dishes")}
        >
          <Ionicons
            name="restaurant-outline"
            size={18}
            color={activeTab === "dishes" ? c.primary : c.textSecondary}
          />
          <Text
            style={[
              styles.textTabLabel,
              { color: activeTab === "dishes" ? c.text : c.textSecondary },
            ]}
          >
            {t("profile.dishes")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.textTab,
            activeTab === "videos" && { backgroundColor: c.card },
          ]}
          onPress={() => setActiveTab("videos")}
        >
          <Ionicons
            name="play-outline"
            size={18}
            color={activeTab === "videos" ? c.primary : c.textSecondary}
          />
          <Text
            style={[
              styles.textTabLabel,
              { color: activeTab === "videos" ? c.text : c.textSecondary },
            ]}
          >
            {t("profile.videos")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.textTab,
            activeTab === "reviews" && { backgroundColor: c.card },
          ]}
          onPress={() => setActiveTab("reviews")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={activeTab === "reviews" ? c.primary : c.textSecondary}
          />
          <Text
            style={[
              styles.textTabLabel,
              { color: activeTab === "reviews" ? c.text : c.textSecondary },
            ]}
          >
            {t("profile.reviews")}
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
                  style={[styles.dishCard, { backgroundColor: c.card }]}
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
                      onError={(e) =>
                        console.log(
                          "Image load error:",
                          dish.picture,
                          e.nativeEvent.error,
                        )
                      }
                    />
                  ) : (
                    <View
                      style={[
                        styles.dishImagePlaceholder,
                        { backgroundColor: c.surface },
                      ]}
                    >
                      <Ionicons
                        name="restaurant"
                        size={28}
                        color={c.textMuted}
                      />
                    </View>
                  )}
                  <View style={styles.dishPriceTag}>
                    <Text style={styles.dishPriceText}>{dish.price} ₸</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                {t("chef.noDishes")}
              </Text>
            </View>
          )}
        </View>
      ) : activeTab === "videos" ? (
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
                  {video.posterUrl ? (
                    <Image
                      source={{ uri: video.posterUrl }}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <VideoThumbnail
                      uri={video.url}
                      style={styles.videoThumbnail}
                      positionMillis={1000}
                    />
                  )}
                  <View style={styles.videoGradient} />
                  <View style={styles.videoStats}>
                    <Ionicons name="play-outline" size={12} color="#fff" />
                    <Text style={styles.videoStatText}>
                      {video.stats?.views || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                  {t("chef.noVideos")}
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
                {review.comment && (
                  <Text
                    style={[styles.reviewComment, { color: c.textSecondary }]}
                  >
                    {review.comment}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                {t("profile.noReviews")}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        isLoading={createReviewMutation.isPending}
        chefName={chef?.users?.name}
      />

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={targetUserId || 0}
        targetType="user"
      />
    </ScrollView>
  );
};

export default ChefDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },

  header: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {},

  profileInfoRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarContainer: { position: "relative" },
  chefBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#F97316",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  profileTexts: { flex: 1 },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  handle: { fontSize: 14, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontWeight: "700", fontSize: 14 },
  dotSep: { marginHorizontal: 4 },
  ordersText: { fontSize: 14 },

  statsRow: { flexDirection: "row", marginBottom: 24, paddingHorizontal: 16 },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  statValue: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 12 },

  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  largeActionButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: { fontWeight: "700", fontSize: 15 },

  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  textTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  textTabLabel: { fontSize: 15, fontWeight: "600" },

  contentSection: { width: "100%" },

  dishesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  dishCard: {
    width: (width - 48) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  }, // 2 columns
  dishImage: { width: "100%", height: "100%" },
  dishImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  dishPriceTag: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dishPriceText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  videoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  videoItem: {
    width: (width - 48) / 3,
    aspectRatio: 0.8,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  }, // 3 columns
  videoThumbnail: { width: "100%", height: "100%" },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  videoStats: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  videoStatText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  emptyState: { alignItems: "center", paddingVertical: 64 },
  emptyText: { fontSize: 16, marginTop: 16 },

  reviewCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
});
