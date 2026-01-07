import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

const { height: H, width: W } = Dimensions.get("window");

type FeedItem = {
  id: string;
  videoUrl: string;
  chefName: string;
  chefAvatar?: string | null;
  title?: string;
  likes: number;
  isLiked?: boolean;
  chefId?: number;
  dishId?: number;
};

const MOCK: FeedItem[] = [
  {
    id: "1",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    chefName: "Chef A",
    chefAvatar: null,
    title: "Плов за 30 минут",
    likes: 128,
    chefId: 1,
    dishId: 10,
  },
  {
    id: "2",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    chefName: "Chef B",
    chefAvatar: null,
    title: "Сырники без масла",
    likes: 94,
    chefId: 2,
    dishId: 11,
  },
];

export default function FeedScreen({ navigation }: any) {
  const c = useColors();

  const listRef = useRef<FlatList>(null);
  const videoRefs = useRef<Record<string, Video | null>>({});
  const [activeId, setActiveId] = useState<string>(MOCK[0]?.id ?? "");
  const [items, setItems] = useState<FeedItem[]>(MOCK);

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 80 }),
    []
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const top = viewableItems?.[0]?.item?.id;
    if (!top) return;
    setActiveId(top);
  }).current;

  const toggleLike = (id: string) => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const liked = !x.isLiked;
        return { ...x, isLiked: liked, likes: x.likes + (liked ? 1 : -1) };
      })
    );
  };

  const renderItem = ({ item }: { item: FeedItem }) => {
    const isActive = item.id === activeId;

    return (
      <View style={styles.page}>
        <Video
          ref={(r) => {
            if (r) videoRefs.current[item.id] = r;
          }}
          style={StyleSheet.absoluteFill}
          source={{ uri: item.videoUrl }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={isActive}
          isMuted={false}
        />

        {/* overlay */}
        <View style={styles.topFade} />
        <View style={styles.bottomFade} />

        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.brand}>Chef</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Chefs")}
            style={[
              styles.topBtn,
              { backgroundColor: "rgba(255,255,255,0.14)" },
            ]}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Right actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleLike(item.id)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={30}
              color={item.isLiked ? "#FF3B30" : "#fff"}
            />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              item.chefId &&
              navigation.navigate("ChefDetail", {
                chefId: item.chefId,
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="person-circle-outline" size={32} color="#fff" />
            <Text style={styles.actionText}>Шеф</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              item.dishId &&
              navigation.navigate("DishDetail", { dishId: item.dishId })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="restaurant-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Блюдо</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          <View style={styles.chefRow}>
            <View style={styles.avatar}>
              {item.chefAvatar ? (
                <Image
                  source={{ uri: item.chefAvatar }}
                  style={styles.avatarImg}
                />
              ) : (
                <Ionicons name="person" size={18} color="#111827" />
              )}
            </View>
            <Text style={styles.chefName}>{item.chefName}</Text>
          </View>

          {item.title ? <Text style={styles.title}>{item.title}</Text> : null}

          <TouchableOpacity
            style={[styles.orderCta, { backgroundColor: "#fff" }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={18} color="#111827" />
            <Text style={styles.orderCtaText}>Перейти в корзину</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        pagingEnabled
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  page: { width: W, height: H, backgroundColor: "#000" },

  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  topBar: {
    position: "absolute",
    top: 52,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 0.2 },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  actions: {
    position: "absolute",
    right: 12,
    bottom: 170,
    alignItems: "center",
  },
  actionBtn: { alignItems: "center", marginBottom: 18 },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "700", marginTop: 6 },

  bottomInfo: { position: "absolute", left: 14, right: 88, bottom: 42 },
  chefRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarImg: { width: 32, height: 32, borderRadius: 12 },
  chefName: { color: "#fff", fontSize: 14, fontWeight: "900" },
  title: { color: "#fff", fontSize: 16, fontWeight: "800", lineHeight: 22 },

  orderCta: {
    marginTop: 14,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  orderCtaText: { color: "#111827", fontSize: 14, fontWeight: "900" },
});
