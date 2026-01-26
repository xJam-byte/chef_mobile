import React, { useMemo,useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

import { Avatar, StarRating, Spinner } from "../../components/ui";
import { PremiumHeader } from "../../components/ui/PremiumHeader";
import {
  useProfile,
  useChefDishes,
  useVideosByAuthor,
  useChefReviews,
  useChefStats,
  useOrders,
  useFollowStats,
  useFollowing
} from "../../lib/hooks";
import { useChefByUserId } from "../../lib/hooks/useChefs";
import { API_BASE_URL } from "../../lib/constants";
import { useColors } from "../../lib/theme";

const { width } = Dimensions.get("window");

type ChefTabType = "dishes" | "videos" | "reviews";
type CustomerTabType = "favorites" | "recent";

export default function ProfileScreen({ navigation }: any) {
  const c = useColors();
  const { t } = useTranslation();

  const { data: profile } = useProfile();

  const [chefActiveTab, setChefActiveTab] = useState<ChefTabType>("dishes");
  const [customerActiveTab, setCustomerActiveTab] = useState<CustomerTabType>("recent");
  
  const avatarUri = profile?.profile_pic
    ? profile.profile_pic.startsWith("http")
      ? profile.profile_pic
      : `${API_BASE_URL}${profile.profile_pic}`
    : null;

  const roleIsChef = profile?.role === "chef";

  // Get chef info if user is a chef
  const { data: chef } = useChefByUserId(profile?.user_id);
  const chefId = chef?.chef_id;

  // Fetch real data from backend
  const { data: videosData } = useVideosByAuthor(profile?.user_id);
  const { data: dishesData } = useChefDishes(chefId);
  const { data: reviews = [] } = useChefReviews(chefId ?? 0);
  const { data: chefStats } = useChefStats(chefId);
  
  // Follow stats
  const { data: followStatsData } = useFollowStats(profile?.user_id);
  const { data: followingList } = useFollowing(profile?.user_id || 0);
  
  const followStats = followStatsData?.data;
  const followingCount = followingList?.data?.length || 0;
  
  // Customer Orders
  const { data: customerOrders } = useOrders(profile?.user_id);

  const videos = useMemo(
    () => videosData?.pages.flatMap((page) => page.items) ?? [],
    [videosData]
  );
  const dishes = dishesData?.data ?? [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("ru-RU").format(Math.round(value));

  const totalOrders = roleIsChef ? (chefStats?.totalOrders || 0) : (customerOrders?.length || 0);
  const subscribers = followStats?.followersCount || 0;
  
  // Render functions
  const renderChefContent = () => (
    <>
      <PremiumHeader
        // title={t('profile.title', 'My Profile')}
        
      >
        <View style={styles.profileInfoRow}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarRing, { borderColor: c.primary }]}>
              <Avatar uri={avatarUri} name={profile?.name} size="lg" />
            </View>
            <View style={[styles.chefBadge, { backgroundColor: c.primary, borderColor: c.surface }]}>
              <Ionicons name="star" size={12} color="#fff" />
            </View>
          </View>

          <View style={styles.profileTexts}>
            <Text style={[styles.name, { color: '#FFF' }]}>{profile?.name}</Text>
            {/* <Text style={[styles.handle, { color: c.text }]}>
              @{profile?.name?.toLowerCase().replace(/\s/g, "")}
            </Text> */}
            <View style={styles.ratingRow}>
              <View style={[styles.ratingPill, { backgroundColor: c.primary + '15' }]}>
                <Ionicons name="star" size={14} color="#FFF" />
                <Text style={[styles.ratingText, { color: '#FFF' }]}>{chef?.rating || '5.0'}</Text>
              </View>
              <Text style={[styles.dotSep, { color: c.textMuted }]}>•</Text>
              <Text style={[styles.ordersText, { color: 'rgba(255,255,255,0.7)' }]}>{totalOrders} {t('orders.title')}</Text>
            </View>
          </View>
          <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </PremiumHeader>

      {/* Floating Stats Cards */}
      <View style={styles.statsContainer}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: c.card, shadowColor: c.text }]}>
              <View style={[styles.statIcon, { backgroundColor: c.text + '08' }]}>
                   <Ionicons name="wallet-outline" size={20} color={c.text} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>{formatCurrency(chefStats?.totalEarnings || 0)}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('chef.earnings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: c.card, shadowColor: c.text }]}>
              <View style={[styles.statIcon, { backgroundColor: c.primary + '15' }]}>
                   <Ionicons name="people-outline" size={20} color={c.primary} />
              </View>
              <Text style={[styles.statValue, { color: c.primary }]}>{subscribers}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('chef.subscribers')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: c.card, shadowColor: c.text }]}>
               <View style={[styles.statIcon, { backgroundColor: c.text + '08' }]}>
                   <Ionicons name="heart-outline" size={20} color={c.text} />
              </View>
              <Text style={[styles.statValue, { color: c.text }]}>{followingCount}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>{t('chef.following')}</Text>
          </TouchableOpacity>
      </View>

      {/* Dashboard Section */}
      <View style={styles.dashboardSection}>
          {/* Earnings Card with Noise/Gradient */}
          <LinearGradient
              colors={c.authGradient} // Use premium gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.earningsCard, { shadowColor: c.primary }]}
          >
              <View style={styles.earningsHeader}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Ionicons name="card" size={20} color="#fff" />
                  </View>
                  <Text style={[styles.earningsTitle, { color: 'rgba(255,255,255,0.9)' }]}>
                      {t('chef.totalEarnings')}
                  </Text>
                  <TouchableOpacity style={{ marginLeft: 'auto' }}>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
              </View>
              <Text style={styles.earningsAmount}>{formatCurrency(chefStats?.totalEarnings || 0)} ₸</Text>
              <View style={styles.earningsFooter}>
                  <View style={styles.trendBadge}>
                      <Ionicons name="trending-up" size={14} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>+12%</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                      {t('chef.thisMonth')}: <Text style={{ color: '#fff', fontWeight: '700' }}>+{formatCurrency(chefStats?.monthlyEarnings || 0)} ₸</Text>
                  </Text>
              </View>
              
              {/* Decorative Circles */}
              <View style={[styles.decoCircle, { right: -30, top: -20, width: 100, height: 100 }]} />
              <View style={[styles.decoCircle, { left: -20, bottom: -40, width: 80, height: 80 }]} />
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
              <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
                  onPress={() => navigation.navigate("AddDish")}
              >
                  <LinearGradient
                    colors={[c.primary + '20', c.primary + '05']}
                    style={styles.actionBtnGradient}
                  >
                      <View style={[styles.actionIcon, { backgroundColor: c.primary }]}>
                          <Ionicons name="add" size={24} color="#fff" />
                      </View>
                      <Text style={[styles.actionBtnTitle, { color: c.text }]}>{t('chef.addDish')}</Text>
                  </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
                  onPress={() => navigation.navigate("AddVideo")}
              >
                  <LinearGradient
                    colors={[c.secondary + '20', c.secondary + '05']}
                    style={styles.actionBtnGradient}
                  >
                        <View style={[styles.actionIcon, { backgroundColor: c.text }]}>
                            <Ionicons name="videocam" size={24} color={c.background} />
                        </View>
                        <Text style={[styles.actionBtnTitle, { color: c.text }]}>{t('chef.addVideo')}</Text>
                  </LinearGradient>
              </TouchableOpacity>
          </View>
      </View>

      {/* Premium Tabs */}
      <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {[
                { key: 'dishes', icon: 'restaurant', label: t('chef.dishes') },
                { key: 'videos', icon: 'play-circle', label: t('chef.videos') },
                { key: 'reviews', icon: 'star', label: t('chef.reviews') },
              ].map((tab: any) => {
                  const isActive = chefActiveTab === tab.key;
                  return (
                      <TouchableOpacity
                          key={tab.key}
                          style={[
                              styles.pillTab, 
                              isActive ? { backgroundColor: c.text } : { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }
                          ]}
                          onPress={() => setChefActiveTab(tab.key)}
                      >
                          <Ionicons 
                              name={tab.icon} 
                              size={16} 
                              color={isActive ? c.background : c.textSecondary} 
                          />
                          <Text style={[
                              styles.pillTabText, 
                              { color: isActive ? c.background : c.textSecondary }
                          ]}>
                              {tab.label}
                          </Text>
                      </TouchableOpacity>
                  )
              })}
          </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
          {chefActiveTab === "videos" && (
              <View style={styles.videoGrid}>
                  {videos.length > 0 ? (
                      videos.slice(0, 9).map((video) => (
                          <TouchableOpacity
                              key={video.id}
                              style={styles.videoItem}
                              onPress={() => navigation.navigate("VideoViewer", { video })}
                          >
                              {/* FIXED: Use Image with posterUrl for better performance, fallback to Video frame */}
                              {video.posterUrl ? (
                                <Image
                                  source={{ uri: video.posterUrl }}
                                  style={styles.videoThumbnail}
                                  resizeMode="cover"
                                />
                              ) : (
                                <Video
                                  source={{ uri: video.url }}
                                  style={styles.videoThumbnail}
                                  resizeMode={ResizeMode.COVER}
                                  shouldPlay={false}
                                  isMuted={true}
                                  status={{ positionMillis: 1500 }} // "Random" frame at 1.5s
                                />
                              )}
                              
                              <LinearGradient
                                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                                  style={styles.videoGradient}
                              />
                              <View style={styles.playIcon}>
                                  <Ionicons name="play" size={20} color="#fff" />
                              </View>
                              <View style={styles.videoStats}>
                                  <Ionicons name="heart" size={12} color="#fff" />
                                  <Text style={styles.videoStatText}>{video.stats?.likes || 0}</Text>
                              </View>
                          </TouchableOpacity>
                      ))
                  ) : (
                      <View style={styles.emptyState}>
                          <View style={[styles.emptyIconCircle, { backgroundColor: c.input }]}>
                              <Ionicons name="videocam-off" size={32} color={c.textMuted} />
                          </View>
                          <Text style={[styles.emptyText, { color: c.textMuted }]}>{t('chef.noVideos')}</Text>
                      </View>
                  )}
              </View>
          )}

          {chefActiveTab === "dishes" && (
              <View style={styles.dishesGrid}>
                  {dishes.length > 0 ? (
                      dishes.map((dish) => (
                          <TouchableOpacity
                              key={dish.dish_id}
                              style={[styles.dishCard, { backgroundColor: c.card, shadowColor: c.text }]}
                              onPress={() => navigation.navigate("DishDetail", { dishId: dish.dish_id })}
                          >
                              {dish.picture ? (
                                  <Image source={{ uri: dish.picture }} style={styles.dishImage} />
                              ) : (
                                  <View style={[styles.dishImage, { backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }]}>
                                      <Ionicons name="restaurant" size={40} color={c.textMuted} />
                                  </View>
                              )}
                              <LinearGradient
                                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                                  style={styles.dishOverlay}
                              >
                                  <Text style={styles.dishPriceText}>{formatCurrency(dish.price)} ₸</Text>
                                  <Text style={styles.dishNameText} numberOfLines={1}>{dish.name}</Text>
                              </LinearGradient>
                          </TouchableOpacity>
                      ))
                  ) : (
                      <View style={styles.emptyState}>
                           <View style={[styles.emptyIconCircle, { backgroundColor: c.input }]}>
                              <Ionicons name="restaurant" size={32} color={c.textMuted} />
                          </View>
                          <Text style={[styles.emptyText, { color: c.textMuted }]}>{t('chef.noDishes')}</Text>
                      </View>
                  )}
              </View>
          )}

          {chefActiveTab === "reviews" && (
              <View style={styles.reviewsContainer}>
                  {reviews.length > 0 ? (
                      reviews.map((review: any) => (
                          <View key={review.review_id} style={[styles.reviewCard, { backgroundColor: c.card, borderColor: c.border }]}>
                              <View style={styles.reviewHeader}>
                                  <View style={styles.reviewUser}>
                                      <Avatar uri={review.reviewer?.profile_pic} name={review.reviewer?.name} size="sm" />
                                      <View style={styles.reviewHeaderInfo}>
                                          <Text style={[styles.reviewName, { color: c.text }]}>{review.reviewer?.name}</Text>
                                          <StarRating rating={review.rating} size={12} />
                                      </View>
                                  </View>
                                  <Text style={[styles.reviewDate, { color: c.textMuted }]}>
                                      {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                                  </Text>
                              </View>
                              <Text style={[styles.reviewComment, { color: c.textSecondary }]}>{review.comment}</Text>
                          </View>
                      ))
                  ) : (
                      <View style={styles.emptyState}>
                           <View style={[styles.emptyIconCircle, { backgroundColor: c.input }]}>
                              <Ionicons name="chatbox" size={32} color={c.textMuted} />
                          </View>
                          <Text style={[styles.emptyText, { color: c.textMuted }]}>{t('chef.noReviews')}</Text>
                      </View>
                  )}
              </View>
          )}
      </View>
    </>
  );

  const renderCustomerContent = () => (
    <>
      <PremiumHeader
        // title={t('profile.title', 'My Profile')}
        
      >
          {/* Header content similar to chef but larger */}
          <View style={styles.customerProfile}>
              <View style={[styles.avatarRing, { borderColor: 'rgba(255,255,255,0.5)', padding: 4 }]}>
                    <Avatar uri={avatarUri} name={profile?.name} size="lg" />
              </View>
              <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{profile?.name}</Text>
                  <Text style={styles.customerPhone}>{profile?.phone_number}</Text>
                  <View style={styles.customerMetaRow}>
                      <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <Ionicons name="person" size={12} color="#fff" />
                          <Text style={styles.roleBadgeText}>{t('common.customer')}</Text>
                      </View>
                  </View>
              </View>
                <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => navigation.navigate("Settings")}>
                    <Ionicons name="settings-outline" size={24} color="#FFF" />
                </TouchableOpacity>
          </View>

          <View style={styles.customerStatsRow}>
              <View style={[styles.customerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={[styles.statValue, { color: '#fff' }]}>{totalOrders}</Text>
                  <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>{t('orders.title')}</Text>
              </View>
              <View style={[styles.customerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={[styles.statValue, { color: '#fff' }]}>{followingCount}</Text>
                  <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>{t('chef.following')}</Text>
              </View>
          </View>
          
           {/* Decorative Circles omitted as PremiumHeader has its own or we can add them if needed, but simple is better for now */}
      </PremiumHeader>

      <View style={{ marginTop: -30, paddingHorizontal: 20, paddingBottom: 100 }}>
          {/* Tabs Floating */}
          <View style={[styles.tabsPillContainer, { backgroundColor: c.card, shadowColor: c.text }]}>
              <TouchableOpacity
                  style={[styles.tabPill, customerActiveTab === "recent" && { backgroundColor: c.primary + '20' }]}
                  onPress={() => setCustomerActiveTab("recent")}
              >
                  <Ionicons name="time" size={20} color={customerActiveTab === "recent" ? c.primary : c.textMuted} />
                  <Text style={[styles.tabPillText, { color: customerActiveTab === "recent" ? c.primary : c.textMuted }]}>
                      {t('profile.recent')}
                  </Text>
              </TouchableOpacity>
              <View style={{ width: 1, height: 24, backgroundColor: c.border }} />
              <TouchableOpacity
                  style={[styles.tabPill, customerActiveTab === "favorites" && { backgroundColor: c.primary + '20' }]}
                  onPress={() => setCustomerActiveTab("favorites")}
              >
                  <Ionicons name="heart" size={20} color={customerActiveTab === "favorites" ? c.primary : c.textMuted} />
                  <Text style={[styles.tabPillText, { color: customerActiveTab === "favorites" ? c.primary : c.textMuted }]}>
                      {t('profile.favorites')}
                  </Text>
              </TouchableOpacity>
          </View>

          {customerActiveTab === "recent" ? (
              <View style={{ marginTop: 24 }}>
                  {customerOrders && customerOrders.length > 0 ? (
                      customerOrders.slice(0, 5).map((order: any) => (
                          <TouchableOpacity
                              key={order.order_id}
                              style={[styles.customerListItem, { backgroundColor: c.card, shadowColor: c.text }]}
                              onPress={() => navigation.navigate("OrderTracking", { orderId: order.order_id })}
                          >
                              {order.order_details?.[0]?.dishes?.picture ? (
                                  <Image
                                      source={{ uri: order.order_details[0].dishes.picture }}
                                      style={styles.orderStartImage}
                                  />
                              ) : (
                                  <View style={[styles.orderStartImage, { backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }]}>
                                      <Ionicons name="receipt" size={24} color={c.textMuted} />
                                  </View>
                              )}
                              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                      <Text style={[styles.customerItemTitle, { color: c.text }]}>
                                          Order #{order.order_id}
                                      </Text>
                                      <Text style={[styles.customerPrice, { color: c.primary }]}>
                                          {formatCurrency(order.total_price)} ₸
                                      </Text>
                                  </View>
                                  <Text style={[styles.customerItemSub, { color: c.textSecondary }]}>
                                      {order.order_details?.length} items • {new Date(order.createdAt).toLocaleDateString()}
                                  </Text>
                                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                      <View style={[styles.statusBadge, { backgroundColor: c.success + '20' }]}>
                                          <Text style={[styles.statusText, { color: c.success }]}>{order.status}</Text>
                                      </View>
                                  </View>
                              </View>
                              <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
                          </TouchableOpacity>
                      ))
                  ) : (
                      <View style={styles.emptyState}>
                          <Ionicons name="receipt-outline" size={48} color={c.textMuted} />
                          <Text style={[styles.emptyText, { color: c.textMuted }]}>{t('orders.emptyState')}</Text>
                      </View>
                  )}
              </View>
          ) : (
              <View style={{ marginTop: 24 }}>
                  {(followingList?.data && followingList.data.length > 0) ? (
                      followingList.data.map((user: any) => (
                          <TouchableOpacity
                              key={user.user_id}
                              style={[styles.customerListItem, { backgroundColor: c.card, shadowColor: c.text }]}
                              onPress={() => navigation.navigate("ChefDetail", { chefId: user.user_id })}
                          >
                              <Avatar uri={user.profile_pic} name={user.name} size="md" />
                              <View style={{ flex: 1, paddingHorizontal: 16 }}>
                                  <Text style={[styles.customerItemTitle, { color: c.text }]}>{user.name}</Text>
                                  <View style={styles.customerDetailsRow}>
                                      <Ionicons name="star" size={14} color={c.primary} />
                                      <Text style={[styles.customerRating, { color: c.text }]}>5.0</Text>
                                      <Text style={{ color: c.textMuted, fontSize: 12 }}>• Chef</Text>
                                  </View>
                              </View>
                              <TouchableOpacity style={[styles.iconButton, { backgroundColor: c.input }]}>
                                  <Ionicons name="heart" size={20} color="#FF3B30" />
                              </TouchableOpacity>
                          </TouchableOpacity>
                      ))
                  ) : (
                      <View style={styles.emptyState}>
                          <Ionicons name="heart-outline" size={48} color={c.textMuted} />
                          <Text style={[styles.emptyText, { color: c.textMuted }]}>{t('profile.noFavorites')}</Text>
                      </View>
                  )}
              </View>
          )}
      </View>
    </>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} showsVerticalScrollIndicator={false}>
      {roleIsChef ? renderChefContent() : renderCustomerContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  headerContainer: { overflow: 'hidden' },
  headerGradient: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 },
  profileInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  avatarContainer: { position: 'relative' },
  avatarRing: { padding: 3, borderRadius: 50, borderWidth: 2 },
  chefBadge: {
      position: 'absolute', bottom: -5, right: -5,
      width: 28, height: 28,
      borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      borderWidth: 3,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 5
  },
  profileTexts: { flex: 1 },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 2, letterSpacing: -0.5 },
  handle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  ratingText: { fontWeight: '800', fontSize: 14 },
  dotSep: { marginHorizontal: 4 },
  ordersText: { fontSize: 14, fontWeight: '500' },

  // Stats
  statsContainer: { 
      flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: -10, marginBottom: 24
  },
  statCard: { 
      flex: 1, padding: 16, borderRadius: 20, 
      alignItems: 'center', justifyContent: 'center',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 
  },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },

  // Dashboard
  dashboardSection: { paddingHorizontal: 20, marginBottom: 32 },
  earningsCard: { 
      padding: 24, borderRadius: 28, overflow: 'hidden', position: 'relative',
      shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10
  },
  earningsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  iconBox: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  earningsTitle: { fontSize: 16, fontWeight: '600' },
  earningsAmount: { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 24, letterSpacing: -1 },
  earningsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  
  decoCircle: { position: 'absolute', borderRadius: 200, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  actionBtnGradient: { padding: 16, alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionBtnTitle: { fontSize: 16, fontWeight: '700' },

  // Tabs
  tabsContainer: { paddingHorizontal: 20, marginBottom: 20 },
  tabsScroll: { gap: 12 },
  pillTab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100 },
  pillTabText: { fontWeight: '700', fontSize: 15 },

  // Content
  contentContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Video Grid High Quality
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  videoItem: { width: (width - 40 - 24) / 3, aspectRatio: 0.7, borderRadius: 16, overflow: 'hidden', position: 'relative', backgroundColor: '#000' },
  videoThumbnail: { width: '100%', height: '100%' },
  videoGradient: { ...StyleSheet.absoluteFillObject },
  playIcon: { position: 'absolute', top: '50%', left: '50%', marginLeft: -12, marginTop: -12 },
  videoStats: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  videoStatText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Dishes Grid
  dishesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  dishCard: { 
      width: (width - 40 - 16) / 2, aspectRatio: 0.9, borderRadius: 24, overflow: 'hidden', 
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 
  },
  dishImage: { width: '100%', height: '100%' },
  dishOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  dishPriceText: { color: '#F97316', fontWeight: '900', fontSize: 18, marginBottom: 2 },
  dishNameText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Reviews
  reviewsContainer: {},
  reviewCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  reviewUser: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewHeaderInfo: {},
  reviewName: { fontWeight: '700', fontSize: 16 },
  reviewDate: { fontSize: 12 },
  reviewComment: { lineHeight: 22, fontSize: 14 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '500' },
  
  // Customer Styles
  customerHeader: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, position: 'relative', overflow: 'hidden' },
  customerProfile: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
  customerInfo: { flex: 1 },
  customerName: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  customerPhone: { color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 12 },
  customerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  roleBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  customerStatsRow: { flexDirection: 'row', gap: 12, marginTop: -20 },
  customerStatCard: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  tabsPillContainer: { 
      flexDirection: 'row', marginHorizontal: 20, borderRadius: 20, padding: 6, 
      alignItems: 'center', gap: 4,
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
      marginTop: 70
  },
  tabPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8, borderRadius: 14 },
  tabPillText: { fontSize: 15, fontWeight: '700' },
  
  customerListItem: { 
      flexDirection: 'row', borderRadius: 24, padding: 12, marginBottom: 16, alignItems: 'center',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  orderStartImage: { width: 70, height: 70, borderRadius: 18 },
  customerItemTitle: { fontSize: 16, fontWeight: '700' },
  customerItemSub: { fontSize: 13 },
  customerDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  customerRating: { fontWeight: '700', fontSize: 14 },
  customerPrice: { fontWeight: '800', fontSize: 16 },
  iconButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
});
