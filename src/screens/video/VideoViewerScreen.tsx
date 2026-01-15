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
  const tabBarHeight = 80;

  const likeMutation = useLikeVideo();
  const unlikeMutation = useUnlikeVideo();
  const { addItem } = useCart();

  const PAGE_HEIGHT = WINDOW_HEIGHT;
  const bottomLift = tabBarHeight + insets.bottom;
  

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

  const handleChefPress = () => {
    if (video.author.chefId) {
      navigation.navigate("ChefDetail", { chefId: video.author.chefId });
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
          <View style={[styles.actions, { bottom: bottomLift - 6 }]}>
            {/* Chef Avatar - Top */}
            <TouchableOpacity
              style={styles.chefAvatarButton}
              onPress={handleChefPress}
              activeOpacity={0.8}
            >
              {video.author.avatar ? (
                <Image source={{ uri: video.author.avatar }} style={styles.chefAvatar} />
              ) : (
                <View style={[styles.chefAvatar, { backgroundColor: "#FF8C42" }]}>
                  <Text style={styles.chefAvatarText}>
                    {video.author.name?.charAt(0).toUpperCase() || "A"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

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
              <Text style={styles.actionText}>
                {video.stats.likes >= 1000 
                  ? `${(video.stats.likes / 1000).toFixed(1)}k`
                  : video.stats.likes}
              </Text>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                showMessage({
                  message: "Поделиться",
                  description: "Функция скоро будет доступна",
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
          {video.dish && (
            <View style={[styles.newBottomInfo, { bottom: bottomLift - 26 }]}>
              {/* Chef Name */}
              <Text style={styles.newChefName}>{video.author.name || "Повар"}</Text>
              
              {/* Dish Name */}
              <Text style={styles.newDishName} numberOfLines={1}>
                {video.dish.name}
              </Text>
              
              {/* Dish Price in Orange */}
              <Text style={styles.newDishPrice}>{Number(video.dish.price)} ₸</Text>
              
              {/* Large Orange Order Button */}
              <TouchableOpacity
                style={styles.orderButton}
                onPress={handleAddToCart}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.orderButtonText}>Заказать</Text>
              </TouchableOpacity>
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
      right: 80,
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

});  
