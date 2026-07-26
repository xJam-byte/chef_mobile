import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "../../lib/theme";
import { useOrder, useProfile, useUpdateOrderStatus } from "../../lib/hooks";
import { Avatar } from "../../components/ui";
import { PremiumHeader } from "../../components/ui/PremiumHeader";

const { width } = Dimensions.get("window");

export default function OrderTrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params ?? {};
  const c = useColors();
  const { t } = useTranslation();
  const { data: order, refetch } = useOrder(orderId);
  const { data: profile } = useProfile();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  // Poll for status updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stepsList = [
    { key: "pending", icon: "receipt", label: t("orders.tracking.steps.pending") },
    { key: "confirmed", icon: "checkmark-circle", label: t("orders.tracking.steps.confirmed") || "Confirmed" },
    { key: "preparing", icon: "flame", label: t("orders.tracking.steps.preparing") },
    { key: "ready", icon: "cube", label: t("orders.tracking.steps.ready") },
    { key: "delivering", icon: "bicycle", label: t("orders.tracking.steps.delivering") },
    { key: "delivered", icon: "checkmark-done", label: t("orders.tracking.steps.delivered") },
  ];

  // Group details by chef
  const chefGroups = useMemo(() => {
    if (!order?.order_details) return [];
    
    const groups = new Map();
    order.order_details.forEach((detail: any) => {
      // Find the chef who is actually fulfilling this dish
      const chefRecord = detail.chef || detail.dishes?.chefs;
      const chefId = chefRecord?.chef_id;
      if (!chefId) return;
      
      if (!groups.has(chefId)) {
        groups.set(chefId, {
          chef: chefRecord,
          items: [],
          status: detail.status || "pending", // min status logic is applied below
        });
      }
      groups.get(chefId).items.push(detail);
      
      // Update group status to the minimum status among all items for this chef
      const currentMinIdx = stepsList.findIndex(s => s.key === groups.get(chefId).status);
      const thisIdx = stepsList.findIndex(s => s.key === detail.status);
      if (thisIdx < currentMinIdx && detail.status !== "cancelled") {
         groups.get(chefId).status = detail.status;
      }
    });
    
    return Array.from(groups.values());
  }, [order, stepsList]);

  // Is current user a chef for this order?
  const myChefGroup = useMemo(() => {
    if (!profile) return null;
    return chefGroups.find(g => g.chef?.userId === profile.user_id);
  }, [chefGroups, profile]);

  // Handle status updates (for chefs)
  const handleUpdateStatus = (newStatus: string) => {
    Alert.alert(t("common.confirm"), `Update order status to ${newStatus}?`, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        onPress: () => {
          updateStatus({ orderId, status: newStatus });
        },
      },
    ]);
  };

  const getNextStatusButton = () => {
    if (!myChefGroup) return null;

    const statusMap: {
      [key: string]: { next: string; label: string; icon: string };
    } = {
      pending: { next: "confirmed", label: "Accept Order", icon: "checkmark-circle" },
      confirmed: { next: "preparing", label: "Start Cooking", icon: "flame" },
      preparing: { next: "ready", label: "Mark Ready", icon: "cube" },
      ready: { next: "delivering", label: "Start Delivery", icon: "bicycle" },
      delivering: { next: "delivered", label: "Complete Order", icon: "checkmark-done" },
    };

    const nextAction = statusMap[myChefGroup.status];
    if (!nextAction) return null;

    return (
      <View style={styles.chefControls}>
        <TouchableOpacity
          style={styles.chefBtn}
          onPress={() => handleUpdateStatus(nextAction.next)}
          disabled={isPending}
        >
          <LinearGradient
            colors={[c.primary, "#E65100"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chefBtnGradient}
          >
            <Ionicons name={nextAction.icon as any} size={24} color="#FFF" />
            <Text style={styles.chefBtnText}>{nextAction.label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const customer = order?.users;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader
        title={t("orders.tracking.title")}
        subtitle={`Order #${orderId}`}
        backButton
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Customer and Order Summary */}
        <View style={styles.rowCards}>
          <View style={[styles.smallCard, { backgroundColor: c.card, shadowColor: c.text }]}>
             <Avatar uri={customer?.profile_pic} name={customer?.name} size="sm" />
             <View style={{ flex: 1 }}>
               <Text style={[styles.cardLabel, { color: c.textSecondary }]}>
                 {t("common.customer")}
               </Text>
               <Text style={[styles.cardValue, { color: c.text }]} numberOfLines={1}>
                 {customer?.name}
               </Text>
             </View>
          </View>
          <View style={[styles.smallCard, { backgroundColor: c.card, shadowColor: c.text }]}>
            <View style={[styles.iconBadge, { backgroundColor: c.primary + "20" }]}>
              <Ionicons name="location" size={20} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: c.textSecondary }]}>
                {t("common.address")}
              </Text>
              <Text style={[styles.cardValue, { color: c.text }]} numberOfLines={2}>
                {order?.addresses?.street || "Pickup"}
              </Text>
            </View>
          </View>
        </View>

        {/* Global Total Price Card */}
        <View style={[styles.totalCard, { backgroundColor: c.card, shadowColor: c.text }]}>
          <Text style={[styles.totalLabel, { color: c.text }]}>
             {t("orders.totalPrice") || "Total Order Price"}
          </Text>
          <Text style={[styles.totalValue, { color: c.primary }]}>
             {Math.round(Number(order?.total_price) || 0)} ₸
          </Text>
        </View>

        {/* Individual Chef Progress Blocks */}
        {chefGroups.map((group, gIdx) => {
          const currentStepIndex = stepsList.findIndex((s) => s.key === group.status);
          const activeStep = currentStepIndex !== -1 ? currentStepIndex : 0;
          
          return (
            <View key={gIdx} style={[styles.card, { backgroundColor: c.card, shadowColor: c.text }]}>
              {/* Chef Header */}
              <View style={styles.chefHeader}>
                <Avatar uri={group.chef?.users?.profile_pic} name={group.chef?.users?.name} size="md" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.chefName, { color: c.text }]}>{group.chef?.users?.name}</Text>
                  <Text style={[styles.chefRole, { color: c.textSecondary }]}>Chef</Text>
                </View>
              </View>

              {/* Status Timeline */}
              <View style={styles.timelineContainer}>
                {stepsList.map((step, index) => {
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;
                  const isLast = index === stepsList.length - 1;

                  return (
                    <View key={step.key} style={styles.stepRow}>
                      <View style={styles.stepLeft}>
                        <View
                          style={[
                            styles.stepIconBox,
                            {
                              backgroundColor: isActive ? c.primary : isCompleted ? c.success : c.input,
                              shadowColor: isActive ? c.primary : undefined,
                            },
                            isActive && styles.activeShadow,
                          ]}
                        >
                          <Ionicons
                            name={step.icon as any}
                            size={16}
                            color={isActive || isCompleted ? "#FFF" : c.textMuted}
                          />
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.stepLine,
                              { backgroundColor: isCompleted ? c.success : c.border },
                            ]}
                          />
                        )}
                      </View>
                      <View style={[styles.stepRight, { opacity: isActive ? 1 : isCompleted ? 0.8 : 0.4 }]}>
                        <Text style={[styles.stepTitle, { color: c.text }]}>
                          {step.label}
                        </Text>
                        {isActive && (
                          <Text style={{ color: c.primary, fontSize: 12, fontWeight: "600" }}>
                            {t("common.loading")}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Items for this Chef */}
              <View style={styles.itemsList}>
                 <Text style={[styles.itemsHeader, { color: c.textSecondary }]}>{t("orders.details")}</Text>
                 {group.items.map((item: any, iIdx: number) => (
                    <View key={iIdx} style={styles.itemRow}>
                      <Text style={[styles.itemQty, { color: c.primary }]}>{item.quantity}x</Text>
                      <Text style={[styles.itemName, { color: c.text }]}>{item.dishes?.name}</Text>
                      <Text style={[styles.itemPrice, { color: c.textSecondary }]}>{Math.round(item.price)} ₸</Text>
                    </View>
                 ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Action Bar for Chef */}
      {getNextStatusButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Row Cards
  rowCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
    marginBottom: 16,
  },
  smallCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  cardValue: { fontSize: 14, fontWeight: "700" },

  // Total Card
  totalCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 24, fontWeight: "900" },

  // Cards
  card: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  chefHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  chefName: { fontSize: 18, fontWeight: "800" },
  chefRole: { fontSize: 14, fontWeight: "600" },
  
  timelineContainer: {
    marginBottom: 20,
  },

  // Steps
  stepRow: { flexDirection: "row", height: 50 },
  stepLeft: { alignItems: "center", marginRight: 16, width: 30 },
  stepIconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  activeShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stepLine: { width: 2, flex: 1, marginVertical: -2 },
  stepRight: { flex: 1, justifyContent: "flex-start", paddingTop: 4 },
  stepTitle: { fontSize: 14, fontWeight: "700" },

  // Items
  itemsList: {
    backgroundColor: "rgba(0,0,0,0.02)",
    padding: 16,
    borderRadius: 16,
  },
  itemsHeader: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemQty: { fontWeight: "800", width: 30 },
  itemName: { flex: 1, fontWeight: "600" },
  itemPrice: { fontWeight: "700" },

  // Chef Controls
  chefControls: { position: "absolute", bottom: 30, left: 20, right: 20 },
  chefBtn: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  chefBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 12,
  },
  chefBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
