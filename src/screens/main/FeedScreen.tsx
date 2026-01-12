/**
 * Feed Screen - TikTok-style vertical video feed
 * Shows videos with linked dishes and add-to-cart functionality
 */

import React, { useRef, useState, useCallback } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { useVideoFeed, useLikeVideo, useUnlikeVideo, useCart } from "../../lib/hooks";
import VideoPlayer from "../../components/video/VideoPlayer";
import { showMessage } from "react-native-flash-message";
import type { VideoFeedItem } from "../../lib/api/videos";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function FeedScreen() {
  const c = useColors();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useVideoFeed();
  const likeMutation = useLikeVideo();
  const unlikeMutation = useUnlikeVideo();
  const { addItem } = useCart();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const videos = data?.pages.flatMap((page) => page.items) ?? [];

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

    addItem({
      dish: {
        dish_id: video.dish.id,
        name: video.dish.name,
        price: video.dish.price,
        picture: video.dish.picture,
        chefId: 0, // Will be fetched from backend
        description: video.dish.description,
        type: "",
        ingredients: "",
        availability_status: "available",
        createdAt: "",
        updatedAt: "",
      },
      quantity: 1,
      preferences: "",
    });

    showMessage({
      message: `${video.dish.name} добавлено в корзину!`,
      type: "success",
      icon: "success",
    });
  };

  const renderVideo = ({ item, index }: { item: VideoFeedItem; index: number }) => {
    const isActive = index === activeIndex;

    return (
      <View style={styles.videoContainer}>
        <VideoPlayer uri={item.url} isActive={isActive} />

        {/* Video Info Overlay */}
        <View style={styles.overlay}>
          {/* Right Side Actions */}
          <View style={styles.actions}>
            {/* Like Button */}
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
              <Text style={styles.actionText}>{item.stats.likes}</Text>
            </TouchableOpacity>

            {/* Views */}
            <View style={styles.actionButton}>
              <Ionicons name="eye-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>{item.stats.views}</Text>
            </View>

            {/* Add to Cart Button (if dish linked) */}
            {item.dish && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cartButton]}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="cart" size={32} color="#fff" />
                <Text style={styles.actionText}>В корзину</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            {/* Author */}
            <View style={styles.authorRow}>
              {item.author.avatar ? (
                <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: c.primary }]}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              )}
              <Text style={styles.authorName}>{item.author.name}</Text>
              {item.author.role === "chef" && (
                <Ionicons name="checkmark-circle" size={16} color={c.primary} />
              )}
            </View>

            {/* Description */}
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Dish Info (if linked) */}
            {item.dish && (
              <View style={styles.dishBanner}>
                {item.dish.picture && (
                  <Image source={{ uri: item.dish.picture }} style={styles.dishImage} />
                )}
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {item.dish.name}
                  </Text>
                  <Text style={styles.dishPrice}>{Number(item.dish.price)} ₸</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddToCart(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={24} color="#fff" />
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

  if (!videos.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="videocam-outline" size={64} color={c.textMuted} />
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          Видео пока нет
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={c.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  videoContainer: {
    height: SCREEN_HEIGHT,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
  },
  actions: {
    position: "absolute",
    right: 12,
    bottom: 100,
    gap: 24,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  cartButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
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
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
  dishBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  dishImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  dishPrice: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF4458",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
});
