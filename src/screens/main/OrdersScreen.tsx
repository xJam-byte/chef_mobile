/**
 * Orders Screen - Order history
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Card, Badge, Spinner } from "../../components/ui";
import { useProfile, useOrders } from "../../lib/hooks";
import { ORDER_STATUS } from "../../lib/constants";
import type { Order } from "../../lib/types";
import { useColors } from "../../lib/theme";

const OrdersScreen = () => {
  const c = useColors();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const userId = profile?.user_id;

  const {
    data: orders,
    isLoading: ordersLoading,
    isRefetching,
    refetch,
  } = useOrders(userId ?? 0);

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (profileLoading) {
    return <Spinner fullScreen text="Загрузка профиля..." />;
  }

  if (!userId) {
    return <Spinner fullScreen text="Подготовка данных..." />;
  }

  if (ordersLoading) {
    return <Spinner fullScreen text="Загрузка заказов..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={orders || []}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={[styles.orderId, { color: c.text }]}>
                Заказ #{item.order_id}
              </Text>
              <Badge
                text={ORDER_STATUS[item.status as keyof typeof ORDER_STATUS]}
                variant={getStatusVariant(item.status)}
                size="sm"
              />
            </View>

            <Text style={[styles.orderDate, { color: c.textMuted }]}>
              {formatDate(item.order_date)}
            </Text>

            {item.orderDetails && item.orderDetails.length > 0 && (
              <View style={[styles.orderItems, { borderTopColor: c.divider }]}>
                {item.orderDetails.slice(0, 3).map((detail: any) => (
                  <Text
                    key={detail.order_detail_id}
                    style={[styles.orderItem, { color: c.textSecondary }]}
                  >
                    • {detail.quantity}x Блюдо #{detail.dishId}
                  </Text>
                ))}

                {item.orderDetails.length > 3 && (
                  <Text style={[styles.moreItems, { color: c.textMuted }]}>
                    +{item.orderDetails.length - 3} ещё
                  </Text>
                )}
              </View>
            )}

            <View style={[styles.orderFooter, { borderTopColor: c.divider }]}>
              <Text style={[styles.totalLabel, { color: c.textSecondary }]}>
                Сумма:
              </Text>
              <Text style={[styles.totalValue, { color: c.primary }]}>
                {Number(item.total_price).toLocaleString()} ₸
              </Text>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={c.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              Заказов пока нет
            </Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Ваши заказы появятся здесь
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  orderCard: { marginBottom: 16 },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: { fontSize: 18, fontWeight: "700" },
  orderDate: { fontSize: 14, marginBottom: 12 },
  orderItems: { paddingVertical: 12, borderTopWidth: 1 },
  orderItem: { fontSize: 14, marginBottom: 4 },
  moreItems: { fontSize: 14, fontStyle: "italic" },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 18, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptyText: { fontSize: 16 },
});
