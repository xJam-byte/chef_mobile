/**
 * Video Viewer Screen - Full-screen video player with feed-style UI
 * Supports swiping through a list of videos (e.g. from Chef Profile)
 */

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Share,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import {
  useLikeVideo,
  useUnlikeVideo,
  useCart,
  useFollowUser,
  useIsFollowing,
} from "../../lib/hooks";
import VideoPlayer from "../../components/video/VideoPlayer";
import { showMessage } from "react-native-flash-message";
import type { VideoFeedItem } from "../../lib/api/videos";
import type { Dish } from "../../lib/types";
import { ReportModal } from "../../components/ui";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

const SubscribeButton = ({ authorId }: { authorId: number }) => {
  const { follow, unfollow } = useFollowUser();
  const { data: isFollowingData } = useIsFollowing(authorId);
  const isFollowing = isFollowingData?.data?.isFollowing;
  const { t } = useTranslation();

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

export default function VideoViewerScreen({ route, navigation }: any) {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Route params: either single 'video' or list 'videos' + 'initialIndex'
  const { video, videos: videosList, initialIndex = 0 } = route.params;

  // Normalize to list
  const videos = useMemo(() => {
    if (videosList && Array.isArray(videosList)) return videosList;
    if (video) return [video];
    return [];
  }, [video, videosList]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const PAGE_HEIGHT = WINDOW_HEIGHT;
  const bottomLift = insets.bottom + 20; // Adjusted since no tab bar

  const likeMutation = useLikeVideo();
  const unlikeMutation = useUnlikeVideo();
  const { addItem } = useCart();

  // Report Modal State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<number>(0);

  // Scroll to initial index on mount
  useEffect(() => {
    if (
      initialIndex > 0 &&
      videos.length > initialIndex &&
      flatListRef.current
    ) {
      // Use a small timeout to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
    }
  }, [initialIndex, videos.length]);

  const handleViewableItemChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const handleLike = (videoItem: VideoFeedItem) => {
    if (videoItem.likedByMe) {
      unlikeMutation.mutate(videoItem.id);
    } else {
      likeMutation.mutate(videoItem.id);
    }
  };

  const handleAddToCart = (videoItem: VideoFeedItem) => {
    if (!videoItem.dish) return;

    const dish: Dish = {
      dish_id: videoItem.dish.id,
      name: videoItem.dish.name,
      price: videoItem.dish.price,
      picture: videoItem.dish.picture,
      chefId: videoItem.author.id,
      description: videoItem.dish.description,
      is_spicy: false,
      type: "main",
      ingredients: "",
      availability_status: "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = addItem(dish, 1, "");

    if (result.alreadyExists) {
      showMessage({
        message: t("feed.alreadyInCart", { dishName: videoItem.dish.name }),
        description: t("feed.changeQuantityInCart"),
        type: "info",
        icon: "info",
      });
    } else {
      showMessage({
        message: t("feed.addedToCart", { dishName: videoItem.dish.name }),
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
    // If we are already on a screen that pushed this viewer, we might be creating a loop or duplicate screen
    // But usually fine to push ChefDetail again
    navigation.push("ChefDetail", { chefId });
  };

  const handleReport = (videoId: string) => {
    setReportTargetId(Number(videoId)); // Assuming IDs are numeric/compatible
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

        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + 10 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

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
                size={34}
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
              <Ionicons name="arrow-redo-outline" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReport(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Info Area */}
          <View style={[styles.bottomContainer, { bottom: bottomLift }]}>
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

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
        initialScrollIndex={initialIndex}
      />
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={reportTargetId}
        targetType="video"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  videoContainer: { width: "100%", position: "relative" },
  overlay: { ...StyleSheet.absoluteFillObject },

  closeButton: {
    position: "absolute",
    left: 20,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 8,
  },

  // Actions
  actions: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    gap: 20,
    zIndex: 20,
  },
  actionButton: { alignItems: "center", gap: 2 },
  actionText: {
    color: "#fff",
    fontSize: 13,
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
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 2,
  },
  userRating: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  userDot: {
    color: "#fff",
    marginHorizontal: 4,
  },
  userTime: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  subscribeButton: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  subscribeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    includeFontPadding: false,
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
    color: "#fff",
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
