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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
} from "../../lib/hooks";
import VideoPlayer from "../../components/video/VideoPlayer";
import { showMessage } from "react-native-flash-message";
import type { VideoFeedItem } from "../../lib/api/videos";
import type { Dish } from "../../lib/types";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/types";


const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function FeedScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const PAGE_HEIGHT = Math.max(1, WINDOW_HEIGHT - tabBarHeight);

  const bottomLift = tabBarHeight + insets.bottom;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useVideoFeed();
  const likeMutation = useLikeVideo();
  const unlikeMutation = useUnlikeVideo();
  const { addItem } = useCart();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const videos = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
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

    const dish: Dish = {
      dish_id: video.dish.id,
      name: video.dish.name,
      price: video.dish.price,
      picture: video.dish.picture,
      chefId: video.author.id,
      description: video.dish.description,
      type: "main",
      ingredients: "",
      availability_status: "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = addItem(dish, 1, "");

    if (result.alreadyExists) {
      showMessage({
        message: t('feed.alreadyInCart', { dishName: video.dish.name }),
        description: t('feed.changeQuantityInCart'),
        type: "info",
        icon: "info",
      });
    } else {
      showMessage({
        message: t('feed.addedToCart', { dishName: video.dish.name }),
        type: "success",
        icon: "success",
      });
    }
  };

  const handleChefPress = (chefId?: number | null) => {
    if (!chefId) {
      showMessage({
        message: t('feed.profileUnavailable'),
        description: t('feed.notAChef'),
        type: "warning",
        icon: "warning",
      });
      return;
    }
    navigation.navigate("ChefDetail", { chefId });
  };

  const renderVideo = ({ item, index }: { item: VideoFeedItem; index: number }) => {
    const isActive = isFocused && index === activeIndex;

    return (
      <View style={[styles.videoContainer, { height: PAGE_HEIGHT }]}>
        <VideoPlayer uri={item.url} isActive={isActive} />

        <View style={styles.overlay}>
          {/* Right Side Actions */}
          <View style={[styles.actions, { bottom: bottomLift - 6 }]}>
            {/* Chef Avatar - Top */}
            <TouchableOpacity
              style={styles.chefAvatarButton}
              onPress={() => handleChefPress(item.author.chefId)}
              activeOpacity={0.8}
            >
              {item.author.avatar ? (
                <Image source={{ uri: item.author.avatar }} style={styles.chefAvatar} />
              ) : (
                <View style={[styles.chefAvatar, { backgroundColor: "#FF8C42" }]}>
                  <Text style={styles.chefAvatarText}>
                    {item.author.name?.charAt(0).toUpperCase() || "A"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.likedByMe ? "heart" : "heart-outline"}
                size={32}
                color={item.likedByMe ? "#FF4458" : "#fff"}
              />
              <Text style={styles.actionText}>
                {item.stats.likes >= 1000 
                  ? `${(item.stats.likes / 1000).toFixed(1)}k`
                  : item.stats.likes}
              </Text>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                showMessage({
                  message: t('feed.share'),
                  description: t('feed.shareComingSoon'),
                  type: "info",
                  icon: "info",
                });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={30} color="#fff" />
              <Text style={styles.actionText}>Поделиться</Text>
            </TouchableOpacity>

            {/* Mute/Unmute Button */}
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Ionicons name="volume-mute-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Info - New Design */}
          {item.dish && (
            <View style={[styles.newBottomInfo, { bottom: bottomLift - 26 }]}>
              {/* Chef Name */}
              <Text style={styles.newChefName}>{item.author.name || t('feed.chefLabel')}</Text>
              
              {/* Dish Name */}
              <Text style={styles.newDishName} numberOfLines={1}>
                {item.dish.name}
              </Text>
              
              {/* Dish Price in Orange */}
              <Text style={styles.newDishPrice}>{Number(item.dish.price)} ₸</Text>
              
              {/* Large Orange Order Button */}
              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.orderButtonText}>{t('feed.order')}</Text>
              </TouchableOpacity>
            </View>
          )}
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

  if (!videos.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="videocam-outline" size={64} color={c.textMuted} />
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          {t('feed.noVideos')}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={[styles.footer, { height: PAGE_HEIGHT }]}>
              <ActivityIndicator size="small" color={c.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, marginTop: 16 },

  videoContainer: { width: "100%" },

  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },

  actions: {
    position: "absolute",
    right: 12,
    gap: 24,
  },
  actionButton: { alignItems: "center", gap: 4 },
  cartButton: {
    padding: 12,
    borderRadius: 50,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  bottomInfo: {
    position: "absolute",
    left: 0,
    right: 0,
    padding: 16,
    gap: 12,
  },

  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  authorName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  dishBannerPinned: {
    position: "absolute",
    left: 12,
    right: 12,
  },
  dishBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,20,20,0.85)",
    borderRadius: 16,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  dishImage: { 
    width: 56, 
    height: 56, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  dishInfo: { flex: 1 },
  dishName: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "700", 
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dishPrice: { 
    color: "#4CAF50", 
    fontSize: 15, 
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: "#FF4458",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF4458",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  // Chef Avatar in Actions
  chefAvatarButton: {
    alignItems: "center",
    marginBottom: 8,
  },
  chefAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  chefAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  // New Bottom Info Section
  newBottomInfo: {
    position: "absolute",
    left: 16,
    right: 80, // Leave space for right actions
    paddingVertical: 16,
  },
  newChefName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  newDishName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  newDishPrice: {
    color: "#FF8C42",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF8C42",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#FF8C42",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  footer: { justifyContent: "center", alignItems: "center" },
});
