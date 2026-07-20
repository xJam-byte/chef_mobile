import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Svg,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { useColors } from "../../lib/theme";
import { useOrder, useProfile, useUpdateOrderStatus } from "../../lib/hooks";
import { Avatar } from "../../components/ui";
import { PremiumHeader } from "../../components/ui/PremiumHeader";
import { API_BASE_URL } from "../../lib/constants";

const { width } = Dimensions.get("window");

export default function OrderTrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params;
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

  // Check if current user is the chef of this order
  const isChef = useMemo(() => {
    if (!order || !profile) return false;
    return order.order_details?.some(
      (detail: any) => detail.dishes?.chefs?.userId === profile.user_id,
    );
  }, [order, profile]);

  // Timer Logic
  const estimatedMinutes = order?.estimated_minutes || 45;
  const createdAt = order?.createdAt
    ? new Date(order.createdAt).getTime()
    : Date.now();
  const targetTime = createdAt + estimatedMinutes * 60000;

  const [timeLeft, setTimeLeft] = useState(estimatedMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diffEx = Math.floor((targetTime - now) / 1000);
      setTimeLeft(diffEx > 0 ? diffEx : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const progress = useMemo(() => {
    const totalSeconds = estimatedMinutes * 60;
    return Math.max(0, Math.min(1, (totalSeconds - timeLeft) / totalSeconds));
  }, [timeLeft, estimatedMinutes]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const steps = [
    {
      key: "pending",
      icon: "receipt",
      label: t("orders.tracking.steps.pending"),
    },
    {
      key: "preparing",
      icon: "flame",
      label: t("orders.tracking.steps.preparing"),
    },
    { key: "ready", icon: "cube", label: t("orders.tracking.steps.ready") },
    {
      key: "delivering",
      icon: "bicycle",
      label: t("orders.tracking.steps.delivering"),
    },
    {
      key: "delivered",
      icon: "checkmark-circle",
      label: t("orders.tracking.steps.delivered"),
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order?.status) || 0;

  // Circular Progress
  const size = 220;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

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

  // Get next status button
  const getNextStatusButton = () => {
    if (!isChef || !order) return null;

    const statusMap: {
      [key: string]: { next: string; label: string; icon: string };
    } = {
      pending: {
        next: "confirmed",
        label: "Accept Order",
        icon: "checkmark-circle",
      },
      confirmed: { next: "preparing", label: "Start Cooking", icon: "flame" },
      preparing: { next: "ready", label: "Mark Ready", icon: "cube" },
      ready: { next: "delivering", label: "Start Delivery", icon: "bicycle" },
      delivering: {
        next: "delivered",
        label: "Complete Order",
        icon: "checkmark-done",
      },
    };

    const currentStatus = order.status;
    const nextAction = statusMap[currentStatus];

    if (!nextAction) return null;

    return (
      <View style={styles.chefControls}>
        <TouchableOpacity
          style={styles.chefBtn}
          onPress={() => handleUpdateStatus(nextAction.next)}
          disabled={isPending}
        >
          <LinearGradient
            colors={[c.primary, "#E65100"]} // Harder gradient
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

  const chef = order?.order_details?.[0]?.dishes?.chefs;
  const customer = order?.users;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Premium Header */}
      <PremiumHeader
        title={t("orders.tracking.title")}
        subtitle={`Order #${orderId}`}
        backButton
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Glowing Timer */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerWrapper, { shadowColor: c.primary }]}>
            <Svg width={size} height={size} style={{ position: "absolute" }}>
              <Defs>
                <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#F97316" stopOpacity="1" />
                  <Stop offset="1" stopColor="#EAB308" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={c.border}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.3}
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#grad)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.timerValue, { color: c.text }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={[styles.timerLabel, { color: c.textSecondary }]}>
                {t("orders.tracking.minutes")}
              </Text>
            </View>
          </View>
          <View style={[styles.estBadge, { backgroundColor: c.card }]}>
            <Text style={[styles.estimatedText, { color: c.text }]}>
              {t("orders.tracking.estimatedTime")}
            </Text>
          </View>
        </View>

        {/* Vertical Steps (More readable) */}
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, shadowColor: c.text },
          ]}
        >
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isLast = index === steps.length - 1;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepIconBox,
                      {
                        backgroundColor: isActive
                          ? c.primary
                          : isCompleted
                            ? c.success
                            : c.input,
                        shadowColor: isActive ? c.primary : undefined,
                      },
                      isActive && styles.activeShadow,
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={18}
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
                <View
                  style={[
                    styles.stepRight,
                    { opacity: isActive ? 1 : isCompleted ? 0.8 : 0.4 },
                  ]}
                >
                  <Text style={[styles.stepTitle, { color: c.text }]}>
                    {step.label}
                  </Text>
                  {isActive && (
                    <Text
                      style={{
                        color: c.primary,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {t("common.loading")}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Info Cards */}
        <View style={styles.rowCards}>
          {/* Address */}
          <View
            style={[
              styles.smallCard,
              { backgroundColor: c.card, shadowColor: c.text },
            ]}
          >
            <View
              style={[styles.iconBadge, { backgroundColor: c.primary + "20" }]}
            >
              <Ionicons name="location" size={20} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: c.textSecondary }]}>
                {t("common.address")}
              </Text>
              <Text
                style={[styles.cardValue, { color: c.text }]}
                numberOfLines={2}
              >
                {order?.addresses?.street || "Pickup"}
              </Text>
            </View>
          </View>

          {/* Person */}
          <View
            style={[
              styles.smallCard,
              { backgroundColor: c.card, shadowColor: c.text },
            ]}
          >
            <Avatar
              uri={isChef ? customer?.profile_pic : chef?.users?.profile_pic}
              name={isChef ? customer?.name : chef?.users?.name}
              size="sm"
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: c.textSecondary }]}>
                {isChef ? t("common.customer") : t("common.chef")}
              </Text>
              <Text
                style={[styles.cardValue, { color: c.text }]}
                numberOfLines={1}
              >
                {isChef ? customer?.name : chef?.users?.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, shadowColor: c.text },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: c.text }]}>
              {t("orders.details")}
            </Text>
            <Text style={[styles.cardTotal, { color: c.primary }]}>
               {Math.round(Number(order?.total_price) || 0)} ₸
            </Text>
          </View>
          {order?.order_details?.map((detail: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={[styles.itemQty, { color: c.primary }]}>
                {detail.quantity}x
              </Text>
              <Text style={[styles.itemName, { color: c.text }]}>
                {detail.dishes?.name}
              </Text>
              <Text style={[styles.itemPrice, { color: c.textSecondary }]}>
                {Math.round(detail.price)} ₸
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Bar for Chef */}
      {isChef && getNextStatusButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header styles removed as PremiumHeader is used

  // Timer
  timerContainer: { alignItems: "center", marginTop: 24, marginBottom: 24 },
  timerWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  timerValue: { fontSize: 48, fontWeight: "900", letterSpacing: -2 },
  timerLabel: {
    fontSize: 14,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: -4,
  },

  estBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  estimatedText: { fontSize: 14, fontWeight: "600" },

  // Cards
  card: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardTotal: { fontSize: 20, fontWeight: "900" },

  // Steps
  stepRow: { flexDirection: "row", height: 60 },
  stepLeft: { alignItems: "center", marginRight: 16, width: 30 },
  stepIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
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
  stepRight: { flex: 1, justifyContent: "flex-start", paddingTop: 6 },
  stepTitle: { fontSize: 16, fontWeight: "700" },

  // Row Cards
  rowCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
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

  // Items
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
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
