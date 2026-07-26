import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "../../lib/theme";
import { useOrders, useProfile, useChefOrders } from "../../lib/hooks";
import { PremiumHeader } from "../../components/ui/PremiumHeader";

type TabType = 'my_orders' | 'incoming_orders';

export default function OrdersScreen({ navigation }: any) {
  const c = useColors();
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  
  const [activeTab, setActiveTab] = useState<TabType>('my_orders');
  
  const isChef = profile?.role === 'chef';

  // My Orders (Outgoing)
  const { data: myOrders = [], isLoading: myLoading, refetch: refetchMy } = useOrders();
  
  // Incoming Orders (For Chef)
  const { data: chefOrders = [], isLoading: chefLoading, refetch: refetchChef } = useChefOrders();

  const [refreshing, setRefreshing] = useState(false);

  const activeOrders = activeTab === 'my_orders' ? myOrders : chefOrders;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMy(), refetchChef()]);
    setRefreshing(false); 
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFB02E';
      case 'confirmed': return '#2E8CFF';
      case 'preparing': return '#FF8C00'; 
      case 'ready': return '#4CAF50';    
      case 'delivering': return '#9C27B0'; 
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#FF3B30';
      default: return c.textSecondary;
    }
  };

  const getStatusLabelKey = (status: string) => `orders.statuses.${status}`;


  const renderHeader = () => (
      <PremiumHeader title={t('orders.title')} />
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {renderHeader()}
      
      {isChef && (
         <View style={styles.tabsWrapper}>
             <View style={[styles.tabContainer, { backgroundColor: c.card, shadowColor: c.text }]}>
                 <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'my_orders' && { backgroundColor: c.primary + '20' }]}
                    onPress={() => setActiveTab('my_orders')}
                 >
                     <Ionicons name="cart" size={16} color={activeTab === 'my_orders' ? c.primary : c.textSecondary} />
                     <Text style={[styles.tabText, { color: activeTab === 'my_orders' ? c.primary : c.textSecondary }]}>
                         {t('orders.tabs.myOrders') || "My Orders"}
                     </Text>
                 </TouchableOpacity>
                 
                 <View style={{ width: 1, height: 20, backgroundColor: c.border }} />

                 <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'incoming_orders' && { backgroundColor: c.primary + '20' }]}
                    onPress={() => setActiveTab('incoming_orders')}
                 >
                     <Ionicons name="restaurant" size={16} color={activeTab === 'incoming_orders' ? c.primary : c.textSecondary} />
                     <Text style={[styles.tabText, { color: activeTab === 'incoming_orders' ? c.primary : c.textSecondary }]}>
                         {t('orders.tabs.incoming') || "Incoming"}
                     </Text>
                     {chefOrders.length > 0 && activeTab !== 'incoming_orders' && (
                         <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B30', position: 'absolute', top: 12, right: 12 }} />
                     )}
                 </TouchableOpacity>
             </View>
         </View>
      )}

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {activeOrders && activeOrders.length > 0 ? (
          activeOrders.map((order: any) => {
              const statusColor = getStatusColor(order.status);
              const dishImage = order.order_details?.[0]?.dishes?.picture;
              
              return (
                <TouchableOpacity
                  key={order.order_id}
                  style={[styles.orderCard, { backgroundColor: c.card, shadowColor: c.text }]}
                  onPress={() => navigation.navigate("OrderTracking", { orderId: order.order_id })}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                       <View style={[styles.idBadge, { backgroundColor: c.input }]}>
                           <Text style={[styles.orderNumber, { color: c.text }]}>#{order.order_id}</Text>
                       </View>
                       <Text style={[styles.orderDate, { color: c.textSecondary }]}>
                         {new Date(order.createdAt).toLocaleDateString()}
                       </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                       <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                       <Text style={[styles.statusText, { color: statusColor }]}>
                          {t(getStatusLabelKey(order.status))}
                       </Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: c.border }]} />

                  <View style={styles.cardBody}>
                     <View style={styles.dishRow}>
                        {dishImage ? (
                             <Image source={{ uri: dishImage }} style={styles.dishImage} />
                        ) : (
                             <View style={[styles.dishImage, { backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }]}>
                                 <Ionicons name="restaurant" size={24} color={c.textMuted} />
                             </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.dishName, { color: c.text }]} numberOfLines={1}>
                                 {order.order_details?.[0]?.dishes?.name || t('orders.dish')}
                            </Text>
                            <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4 }}>
                                {order.order_details?.length || 1} {t('orders.items', 'items')}
                                {(order.order_details?.length || 0) > 1 && ` • +${(order.order_details?.length || 0) - 1} ${t('orders.more', 'more')}`}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                             <Text style={[styles.totalPrice, { color: c.primary }]}>{Math.round(order.total_price)} ₸</Text>
                        </View>
                     </View>
                  </View>
                  
                  <View style={[styles.cardFooter, { borderTopColor: c.border }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="time-outline" size={14} color={c.textSecondary} />
                          <Text style={{ color: c.textSecondary, fontSize: 12 }}>
                              {t('orders.tracking.estimatedTime')}: 45 {t('orders.tracking.minutes')}
                          </Text>
                      </View>
                      <View style={[styles.arrowBtn, { backgroundColor: c.input }]}>
                          <Ionicons name="arrow-forward" size={14} color={c.text} />
                      </View>
                  </View>
                </TouchableOpacity>
              );
          })
        ) : (
          <View style={styles.emptyState}>
             <View style={[styles.emptyIconCircle, { backgroundColor: c.input }]}>
                 <Ionicons name="receipt" size={40} color={c.textMuted} />
             </View>
             <Text style={[styles.emptyTitle, { color: c.textMuted }]}>{t('orders.emptyState')}</Text>
             <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>{t('orders.emptyDesc')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // header: { ... } -> Removed
  
  tabsWrapper: { paddingHorizontal: 20, marginBottom: 10, marginTop: 10 },
  tabContainer: { 
      flexDirection: 'row', padding: 6, borderRadius: 16, alignItems: 'center',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  tabButton: { flex: 1, flexDirection: 'row', gap: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  tabText: { fontWeight: '700', fontSize: 14 },

  orderCard: { 
      borderRadius: 24, marginBottom: 20, 
      shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  idBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  orderNumber: { fontSize: 14, fontWeight: '800' },
  orderDate: { fontSize: 12, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  
  divider: { height: 1, marginHorizontal: 16 },
  
  cardBody: { padding: 16 },
  dishRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dishImage: { width: 48, height: 48, borderRadius: 12 },
  dishName: { fontSize: 16, fontWeight: '700' },
  
  totalPrice: { fontSize: 18, fontWeight: '900' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderTopWidth: 1, borderStyle: 'dashed' },
  arrowBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 16 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyDesc: { fontSize: 15, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
});
