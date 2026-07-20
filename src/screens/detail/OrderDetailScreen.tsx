import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

import { useTheme } from "../../lib/theme";
import { useOrder } from "../../lib/hooks";
import { useOrderDelivery } from "../../lib/hooks/useSchedule";
import { RootStackParamList } from "../../navigation/types";
import { Spinner, Avatar } from "../../components/ui";

type OrderDetailRouteProp = RouteProp<RootStackParamList, "OrderDetail">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const OrderDetailScreen = () => {
  const { theme: c, themeName } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;

  const { data: order, isLoading } = useOrder(orderId);
  const { data: delivery } = useOrderDelivery(orderId);

  const statusColor = useMemo(() => {
    switch (order?.status) {
      case "pending":
        return "#FFB020";
      case "confirmed":
        return c.primary;
      case "delivered":
        return "#00C851";
      case "cancelled":
        return "#FF4444";
      default:
        return c.textSecondary;
    }
  }, [order?.status, c]);

  const deliveryCost = 500; // Fixed for now, can be dynamic later

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Spinner />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.text }}>{t("common.error")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={themeName === "dark" ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          {t("orders.title")} #{order.order_id}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {!!delivery?.status && (
            <Text style={[styles.label, { color: c.textSecondary }]}>
              {t("delivery.status")}: {t(`delivery.statuses.${delivery.status}`, delivery.status)}
            </Text>
          )}
          <Text style={[styles.label, { color: c.textSecondary }]}>{t("orders.status")}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {order.status?.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.date, { color: c.textMuted }]}>
            {new Date(order.order_date).toLocaleString()}
          </Text>
        </View>

        {/* Delivery Address */}
        {order.addresses && (
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeader}>
                <Ionicons name="location-outline" size={20} color={c.primary} />
                <Text style={[styles.cardTitle, { color: c.text }]}>{t("common.address")}</Text>
            </View>
            <Text style={[styles.addressText, { color: c.text }]}>
                {order.addresses.street}, {order.addresses.city}
            </Text>
            {order.addresses.postalCode && (
                 <Text style={[styles.addressSub, { color: c.textSecondary }]}>
                 {order.addresses.postalCode}
               </Text>
            )}
            </View>
        )}

        {/* Order Items */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeader}>
                <Ionicons name="fast-food-outline" size={20} color={c.primary} />
                <Text style={[styles.cardTitle, { color: c.text }]}>{t("orders.details")}</Text>
            </View>
            
            {order.order_details?.map((item: any) => (
                <View key={item.order_detail_id} style={[styles.itemRow, { borderBottomColor: c.divider }]}>
                     <TouchableOpacity 
                        style={styles.itemInfo}
                        onPress={() => navigation.navigate("DishDetail", { dishId: item.dishId })}
                     >
                        <Text style={[styles.itemName, { color: c.text }]}>
                            {item.quantity}x {item.dishes?.name || `Dish #${item.dishId}`}
                        </Text>
                        {!!item.preferences && (
                            <Text style={[styles.itemPrefs, { color: c.textSecondary }]}>
                                {item.preferences}
                            </Text>
                        )}
                        {/* Chef Info if available (nested via backend include) */}
                        {item.dishes?.chefs?.users && (
                           <Text style={[styles.chefName, { color: c.textMuted }]}>
                             By {item.dishes.chefs.users.name}
                           </Text>
                        )}
                     </TouchableOpacity>
                     <Text style={[styles.itemPrice, { color: c.text }]}>
                        {Number(item.price).toLocaleString()} ₸
                     </Text>
                </View>
            ))}

            {/* Total Section */}
            <View style={styles.totalSection}>
                <View style={styles.row}>
                    <Text style={{ color: c.textSecondary }}>{t("cart.subtotal")}</Text>
                    <Text style={{ color: c.text }}>
                         {(Number(order.total_price) - deliveryCost).toLocaleString()} ₸
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={{ color: c.textSecondary }}>{t("cart.delivery")}</Text>
                    <Text style={{ color: c.text }}>{deliveryCost} ₸</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: c.divider }]} />
                <View style={styles.row}>
                    <Text style={[styles.totalLabel, { color: c.text }]}>{t("cart.total")}</Text>
                    <Text style={[styles.totalValue, { color: c.primary }]}>
                        {Number(order.total_price).toLocaleString()} ₸
                    </Text>
                </View>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: Platform.OS === "ios" ? 44 : 56,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  date: {
    fontSize: 12,
  },
  addressText: {
    fontSize: 15,
    marginBottom: 4,
  },
  addressSub: {
    fontSize: 13,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrefs: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  chefName: {
     fontSize: 12,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
  },
  totalSection: {
    marginTop: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
  },
});

export default OrderDetailScreen;
