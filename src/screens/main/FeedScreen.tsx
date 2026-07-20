/**
 * Feed Screen - TikTok-style vertical video feed
 * Shows videos with linked dishes and add-to-cart functionality
 */

import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";

import { useColors } from "../../lib/theme";
import {
  useVideoFeed,
  useLikeVideo,
  useUnlikeVideo,
  useCart,
  useFollowUser,
  useIsFollowing,
  useProfile,
} from "../../lib/hooks";
import VideoPlayer from "../../components/video/VideoPlayer";
import ReactionsSheet from "../../components/video/ReactionsSheet";
import { showMessage } from "react-native-flash-message";
import type { VideoFeedItem } from "../../lib/api/videos";
import type { Dish } from "../../lib/types";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/types";
import { ReportModal } from "../../components/ui";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

const SubscribeButton = ({
  authorId,
  currentUserId,
}: {
  authorId: number;
  currentUserId?: number;
}) => {
  const { follow, unfollow } = useFollowUser();
  const { data: isFollowingData } = useIsFollowing(authorId);
  const isFollowing = isFollowingData?.data?.isFollowing;
  const { t } = useTranslation();

  // Don't show follow button for own profile
  if (currentUserId && authorId === currentUserId) return null;
  if (isFollowing) return null;

  return (
    <TouchableOpacity
      style={styles.subscribeButton}
      onPress={() => follow(authorId)}
    >
      <Text style={styles.subscribeText}>
        {t("profile.follow") || "Follow"}
      </Text>
    </TouchableOpacity>
  );
};

export default function FeedScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [reactionsVideoId, setReactionsVideoId] = useState<string | null>(null);

  const PAGE_HEIGHT = Math.max(1, WINDOW_HEIGHT - tabBarHeight);
  const bottomLift = tabBarHeight + insets.bottom;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useVideoFeed(activeTab);

  const likeMutation = useLikeVideo();
  const unlikeMutation = useUnlikeVideo();
  const { addItem } = useCart();
  const { data: profile } = useProfile();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Report Modal State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string>("");

  const videos = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const handleViewableItemChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const handleLike = (video: VideoFeedItem) => {
    if (video.likedByMe) {
      unlikeMutation.mutate(video.id);
    } else {
      likeMutation.mutate(video.id);
    }
  };

  const handleAddToCart = (video: VideoFeedItem) => {
    if (!video.dish) return;

    // Prevent chef from ordering their own dish
    if (profile?.user_id && video.author.id === profile.user_id) {
      showMessage({
        message: t("common.error"),
        description: t("dish.cantOrderOwn", "You cannot order your own dishes"),
        type: "warning",
        icon: "warning",
      });
      return;
    }

    const dish: Dish = {
      dish_id: video.dish.id,
      name: video.dish.name,
      price: video.dish.price,
      picture: video.dish.picture,
      chefId: video.author.id,
      description: video.dish.description,
      type: "main",
      ingredients: "",
      is_spicy: false,
      availability_status: "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = addItem(dish, 1, "");

    if (result.alreadyExists) {
      showMessage({
        message: t("feed.alreadyInCart", { dishName: video.dish.name }),
        description: t("feed.changeQuantityInCart"),
        type: "info",
        icon: "info",
      });
    } else {
      showMessage({
        message: t("feed.addedToCart", { dishName: video.dish.name }),
        type: "success",
        icon: "success",
      });
    }
  };

  const handleChefPress = (chefId?: number | null) => {
    if (!chefId) {
      showMessage({
        message: t("feed.profileUnavailable"),
        description: t("feed.notAChef"),
        type: "warning",
        icon: "warning",
      });
      return;
    }
    navigation.navigate("ChefDetail", { chefId });
  };

  const handleReport = (videoId: string) => {
    setReportTargetId(videoId); // video ids are uuid strings
    setReportModalVisible(true);
  };

  const renderVideo = ({
    item,
    index,
  }: {
    item: VideoFeedItem;
    index: number;
  }) => {
    const isActive = isFocused && index === activeIndex;

    return (
      <View style={[styles.videoContainer, { height: PAGE_HEIGHT }]}>
        <VideoPlayer uri={item.url} isActive={isActive} />

        <View style={styles.overlay}>
          {/* Right Side Actions */}
          <View style={[styles.actions, { bottom: bottomLift + 50 }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.likedByMe ? "heart" : "heart-outline"}
                size={26}
                color={item.likedByMe ? "#EF4444" : "#fff"}
              />
              <Text style={styles.actionText}>
                {item.stats.likes >= 1000
                  ? `${(item.stats.likes / 1000).toFixed(1)}k`
                  : item.stats.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Share.share({
                  message: `Check out this dish by ${item.author.name}! \n\nchefmobile://video/${item.id}`,
                  url: `chefmobile://video/${item.id}`, // for iOS
                });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-redo-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setReactionsVideoId(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>{t("reactions.short")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReport(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Info Area */}
          <View style={[styles.bottomContainer, { bottom: bottomLift - 50 }]}>
            {/* Отмеченные повара */}
            {!!item.tagged_chefs?.length && (
              <View style={styles.taggedRow}>
                {item.tagged_chefs.map((tc) => (
                  <TouchableOpacity
                    key={tc.chefId}
                    style={styles.taggedPill}
                    onPress={() => handleChefPress(tc.chefId)}
                  >
                    <Ionicons name="person" size={12} color="#fff" />
                    <Text style={styles.taggedText} numberOfLines={1}>
                      {tc.username ? `@${tc.username}` : tc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* User Info Row */}
            <View style={styles.userInfoRow}>
              <TouchableOpacity
                onPress={() => handleChefPress(item.author.chefId)}
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                {item.author.avatar ? (
                  <Image
                    source={{ uri: item.author.avatar }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View
                    style={[styles.userAvatar, { backgroundColor: c.primary }]}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      {item.author.name?.[0]}
                    </Text>
                  </View>
                )}
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.userName}>{item.author.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="star" size={12} color={c.warning} />
                    <Text style={styles.userRating}>4.9</Text>
                    <Text style={styles.userDot}>•</Text>
                    <Text style={styles.userTime}>~25 мин</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <SubscribeButton authorId={item.author.id} />
            </View>

            {/* Description */}
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description ||
                item.dish?.description ||
                "Готовлю настоящий бешбармак по рецепту бабушки 👨‍🍳"}
            </Text>

            {/* Action Bar */}
            {item.dish && (
              <View style={styles.actionBar}>
                <TouchableOpacity
                  style={styles.dishMiniCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate("DishDetail", { dishId: item.dish!.id })
                  }
                >
                  <Image
                    source={{ uri: item.dish.picture }}
                    style={styles.dishMiniImage}
                  />
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={styles.dishMiniName} numberOfLines={1}>
                      {item.dish.name}
                    </Text>
                    <Text style={styles.dishMiniPrice}>
                      {item.dish.price} ₸
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    { backgroundColor: c.primary },
                  ]}
                  onPress={() => handleAddToCart(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={20} color="#fff" />
                  <Text style={styles.addToCartText}>В корзину</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!videos.length && !isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: "white" }}>No videos</Text>
      </View>
    );
  }

  return (
    // Без верхнего edge: видео уходит под статусбар, как в TikTok
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={PAGE_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: PAGE_HEIGHT,
          offset: PAGE_HEIGHT * index,
          index,
        })}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
      {/* Top overlay: единый слой табов поверх ленты (как в TikTok),
          не перерисовывается на каждом видео */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent"]}
        style={[styles.topScrim, { height: insets.top + 80 }]}
        pointerEvents="none"
      />
      <View
        style={[styles.topTabsContainer, { top: insets.top + 6 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => setActiveTab("following")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.tabItem}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "following" ? styles.activeTab : styles.inactiveTab,
            ]}
          >
            {t("feed.following")}
          </Text>
          <View
            style={[
              styles.activeIndicator,
              activeTab !== "following" && { opacity: 0 },
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("forYou")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.tabItem}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "forYou" ? styles.activeTab : styles.inactiveTab,
            ]}
          >
            {t("feed.forYou")}
          </Text>
          <View
            style={[
              styles.activeIndicator,
              activeTab !== "forYou" && { opacity: 0 },
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Battle")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.trophyButton}
        >
          <Ionicons name="trophy-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={reportTargetId}
        targetType="video"
      />

      <ReactionsSheet
        videoId={reactionsVideoId}
        onClose={() => setReactionsVideoId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  taggedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  taggedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: 140,
  },
  taggedText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  container: { flex: 1, backgroundColor: "#000" },
  centered: { justifyContent: "center", alignItems: "center" },

  videoContainer: { width: "100%", position: "relative" },
  overlay: { ...StyleSheet.absoluteFillObject },

  // Top Tabs (единый оверлей поверх FlatList, TikTok-style)
  topScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  topTabsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    zIndex: 10,
  },
  tabItem: { alignItems: "center" },
  tabText: {
    fontSize: 16,
    letterSpacing: 0.2,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowRadius: 3,
  },
  activeTab: { color: "#fff", fontWeight: "800" },
  inactiveTab: { color: "rgba(255,255,255,0.65)", fontWeight: "600" },
  activeIndicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  trophyButton: {
    position: "absolute",
    right: 16,
    top: 2,
  },

  // Actions
  actions: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    gap: 16,
    zIndex: 20,
  },
  actionButton: { alignItems: "center", gap: 2 },
  actionText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 2,
  },

  // Bottom Info
  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    /* Gradient protection could be added here as a background image or View */
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 2,
  },
  userRating: {
    color: "#fff", // or star color
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  userDot: {
    color: "#fff",
    marginHorizontal: 4,
  },
  userTime: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
  },
  subscribeButton: {
    borderWidth: 1.5, // Slightly thicker border for better visibility
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)", // Slightly darker background for contrast
    alignItems: "center", // Critical fix for 'crooked' text
    justifyContent: "center",
    marginRight: 60,
  },
  subscribeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false, // Prevents Android vertical alignment quirks
  },
  descriptionText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 2,
  },

  // Action Bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dishMiniCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(30,30,30,0.9)",
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    gap: 10,
  },
  dishMiniImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  dishMiniName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  dishMiniPrice: {
    color: "#fff", // White price on dark card looks clean
    fontSize: 13,
    fontWeight: "400",
    opacity: 0.8,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
