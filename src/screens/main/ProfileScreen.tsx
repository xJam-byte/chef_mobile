import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../components/ui";
import { useProfile } from "../../lib/hooks";
import { API_BASE_URL } from "../../lib/constants";
import { useColors } from "../../lib/theme";

const { width } = Dimensions.get("window");
const VIDEO_SIZE = (width - 4) / 3; // 3 columns with 1px gaps
const VIDEO_HEIGHT = VIDEO_SIZE * 1.33; // 4:5 aspect ratio - taller videos

type TabType = "videos" | "dishes";

export default function ProfileScreen({ navigation }: any) {
  const c = useColors();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState<TabType>("videos");

  const avatarUri = profile?.profile_pic
    ? profile.profile_pic.startsWith("http")
      ? profile.profile_pic
      : `${API_BASE_URL}${profile.profile_pic}`
    : null;

  const roleIsChef = profile?.role === "chef";

  // Mock video data for demonstration (would come from API)
  const mockVideos = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    thumbnail: `https://picsum.photos/200/200?random=${i}`,
  }));

  // Mock dishes data for demonstration (would come from API)
  const mockDishes = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Блюдо ${i + 1}`,
    price: 1500 + i * 500,
    image: `https://picsum.photos/200/200?random=${i + 50}`,
  }));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header with Settings Icon */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Профиль</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Beautiful Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.profileHeader}>
            <Avatar uri={avatarUri} name={profile?.name} size="xl" />

            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: c.text }]}>
                {profile?.name || "Пользователь"}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={14} color={c.textSecondary} />
                <Text style={[styles.infoText, { color: c.textSecondary }]}>
                  {profile?.email}
                </Text>
              </View>

              {profile?.phone_number && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={14} color={c.textSecondary} />
                  <Text style={[styles.infoText, { color: c.textSecondary }]}>
                    {profile.phone_number}
                  </Text>
                </View>
              )}

              {/* Role Badge */}
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: c.primary + "20", borderColor: c.primary + "40" },
                ]}
              >
                <Ionicons
                  name={roleIsChef ? "restaurant" : "person"}
                  size={12}
                  color={c.primary}
                />
                <Text style={[styles.roleText, { color: c.primary }]}>
                  {roleIsChef ? "Повар" : "Клиент"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chef-specific content */}
        {roleIsChef && (
          <View style={styles.chefContent}>
            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: c.primary }]}
                onPress={() => navigation.navigate("AddDish")}
                activeOpacity={0.8}
              >
                <Ionicons name="restaurant" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Добавить блюдо</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: c.primary }]}
                onPress={() => navigation.navigate("AddVideo")}
                activeOpacity={0.8}
              >
                <Ionicons name="videocam" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Добавить видео</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Switcher */}
            <View style={[styles.tabSwitcher, { backgroundColor: c.surface, borderColor: c.border }]}>
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
                  size={18}
                  color={activeTab === "videos" ? c.primary : c.textMuted}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === "videos" ? c.primary : c.textMuted },
                  ]}
                >
                  Видео ({mockVideos.length})
                </Text>
              </TouchableOpacity>

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
                  size={18}
                  color={activeTab === "dishes" ? c.primary : c.textMuted}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === "dishes" ? c.primary : c.textMuted },
                  ]}
                >
                  Блюда ({mockDishes.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content based on active tab */}
            {activeTab === "videos" ? (
              // Instagram-style Video Grid (3 columns)
              <View style={styles.videoGrid}>
                {mockVideos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoItem}
                    activeOpacity={0.8}
                    onPress={() => {
                      console.log("Video clicked:", video.id);
                    }}
                  >
                    <Image
                      source={{ uri: video.thumbnail }}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.playOverlay}>
                      <Ionicons name="play-circle" size={32} color="#fff" style={{ opacity: 0.9 }} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Dishes Grid (2 columns)
              <View style={styles.dishesGrid}>
                {mockDishes.map((dish) => (
                  <TouchableOpacity
                    key={dish.id}
                    style={[styles.dishCard, { backgroundColor: c.card, borderColor: c.border }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      console.log("Dish clicked:", dish.id);
                    }}
                  >
                    <Image
                      source={{ uri: dish.image }}
                      style={styles.dishImage}
                      resizeMode="cover"
                    />
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
            )}
          </View>
        )}

        {/* Customer view - show message or call to action */}
        {!roleIsChef && (
          <View style={[styles.customerCta, { backgroundColor: c.card }]}>
            <Ionicons name="restaurant-outline" size={48} color={c.textMuted} />
            <Text style={[styles.ctaTitle, { color: c.text }]}>
              Хотите стать поваром?
            </Text>
            <Text style={[styles.ctaText, { color: c.textSecondary }]}>
              Публикуйте свои блюда и начните принимать заказы
            </Text>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: c.primary }]}
              onPress={() => {
                navigation.navigate("Settings");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Перейти в настройки</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  settingsBtn: {
    padding: 4,
  },
  profileCard: {
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  chefContent: {
    // No horizontal padding for Instagram-style full-width grid
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  tabSwitcher: {
    flexDirection: "row",
    marginBottom: 16,
    marginHorizontal: 16,
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
  dishesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dishCard: {
    width: (width - 44) / 2, // 2 columns
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
  customerCta: {
    margin: 16,
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  bottomPadding: {
    height: 32,
  },
});
