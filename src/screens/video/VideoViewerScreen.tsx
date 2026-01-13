/**
 * Video Viewer Screen - Full-screen single video player
 * Similar to FeedScreen but for viewing a single video
 */

import React from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { useLikeVideo, useUnlikeVideo, useCart } from "../../lib/hooks";
import VideoPlayer from "../../components/video/VideoPlayer";
import { showMessage } from "react-native-flash-message";
import type { VideoFeedItem } from "../../lib/api/videos";
import type { Dish } from "../../lib/types";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function VideoViewerScreen({ route, navigation }: any) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { video }: { video: VideoFeedItem } = route.params;

  const likeMutation = useLikeVideo();
  const unlikeMutation = useUnlikeVideo();
  const { addItem } = useCart();

  const PAGE_HEIGHT = WINDOW_HEIGHT;
  const bottomLift = insets.bottom;

  const handleLike = () => {
    if (video.likedByMe) {
      unlikeMutation.mutate(video.id);
    } else {
      likeMutation.mutate(video.id);
    }
  };

  const handleAddToCart = () => {
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
        message: `${video.dish.name} уже в корзине`,
        description: "Измените количество в корзине",
        type: "info",
        icon: "info",
      });
    } else {
      showMessage({
        message: `${video.dish.name} добавлено в корзину!`,
        type: "success",
        icon: "success",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={[styles.videoContainer, { height: PAGE_HEIGHT }]}>
        <VideoPlayer uri={video.url} isActive={true} />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>

        <View style={styles.overlay}>
          {/* Right Side Actions */}
          <View style={[styles.actions, { bottom: bottomLift + 80 }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons
                name={video.likedByMe ? "heart" : "heart-outline"}
                size={32}
                color={video.likedByMe ? "#FF4458" : "#fff"}
              />
              <Text style={styles.actionText}>{video.stats.likes}</Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Ionicons name="eye-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>{video.stats.views}</Text>
            </View>

            {video.dish && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cartButton]}
                onPress={handleAddToCart}
                activeOpacity={0.7}
              >
                <Ionicons name="cart" size={32} color="#fff" />
                <Text style={styles.actionText}>В корзину</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Info */}
          <View style={[styles.bottomInfo, { bottom: bottomLift + 20 }]}>
            <View style={styles.authorRow}>
              {video.author.avatar ? (
                <Image source={{ uri: video.author.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: c.primary }]}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              )}
              <Text style={styles.authorName}>{video.author.name}</Text>
              {video.author.role === "chef" && (
                <Ionicons name="checkmark-circle" size={16} color={c.primary} />
              )}
            </View>

            {video.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {video.description}
              </Text>
            ) : null}

            {/* Spacer под pinned-banner, чтобы текст не залезал под него */}
            {video.dish ? <View style={{ height: 92 }} /> : null}
          </View>

          {/* Dish banner pinned above bottom */}
          {video.dish && (
            <View style={[styles.dishBannerPinned, { bottom: bottomLift + 20 }]}>
              <View style={styles.dishBanner}>
                {video.dish.picture && (
                  <Image source={{ uri: video.dish.picture }} style={styles.dishImage} />
                )}
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {video.dish.name}
                  </Text>
                  <Text style={styles.dishPrice}>{Number(video.dish.price)} ₸</Text>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddToCart}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoContainer: { width: "100%" },

  closeButton: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 4,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  actions: {
    position: "absolute",
    right: 12,
    gap: 24,
  },
  actionButton: { alignItems: "center", gap: 4 },
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
    position: "absolute",
    left: 0,
    right: 0,
    padding: 16,
    gap: 12,
  },

  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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

  dishBannerPinned: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  dishBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  dishImage: { width: 50, height: 50, borderRadius: 8 },
  dishInfo: { flex: 1 },
  dishName: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  dishPrice: { color: "#4CAF50", fontSize: 16, fontWeight: "700" },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF4458",
    alignItems: "center",
    justifyContent: "center",
  },
});
