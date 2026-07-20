import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, PremiumHeader } from "../../components/ui";
import { useColors } from "../../lib/theme";
import { useMyAddresses, useCart, useProfile } from "../../lib/hooks";
import { useWallet } from "../../lib/hooks/useWallet";
import { useOrderQuote } from "../../lib/hooks/useOrders";

// Фолбэк-доля чека для коинов, пока quote не загрузился (синхронно с бэкендом)
const MAX_COIN_SHARE = 0.5;

export default function CheckoutScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { items } = useCart();
  const { data: profile } = useProfile();
  const { data: addresses = [] } = useMyAddresses(profile?.user_id);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );

  // Sync selectedAddressId when addresses are loaded
  React.useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      setSelectedAddressId(addresses[0].address_id);
    }
  }, [addresses, selectedAddressId]);

  // Filter out own dishes (self-order prevention).
  // dish.chefId is chefs.chef_id, so compare against the profile's chef record.
  const myChefId = profile?.chefs?.[0]?.chef_id;

  const validItems = React.useMemo(() => {
    if (!myChefId) return items;
    // исполнитель позиции: выбранный повар или автор блюда
    return items.filter(
      (item) => (item.chefId ?? item.dish.chefId) !== myChefId,
    );
  }, [items, myChefId]);

  const subtotal = React.useMemo(
    () =>
      validItems.reduce(
        (sum, item) =>
          sum + (item.offerPrice ?? Number(item.dish.price)) * item.quantity,
        0,
      ),
    [validItems],
  );

  // Серверный расчёт чека: скидка первооткрывателя, лимит коинов, итог
  const quoteDto = React.useMemo(
    () =>
      validItems.length > 0
        ? {
            delivery_address_id: selectedAddressId ?? undefined,
            items: validItems.map((item) => ({
              dishId: item.dish.dish_id,
              quantity: item.quantity,
              preferences: item.preferences ?? "",
              ...(item.chefId ? { chefId: item.chefId } : {}),
            })),
          }
        : null,
    [validItems, selectedAddressId],
  ) as any;
  const { data: quote, error: quoteError } = useOrderQuote(quoteDto);

  // Оплата коинами (1 коин = 1 ₸, максимум 50% чека после скидок)
  const { data: wallet } = useWallet();
  const [useCoins, setUseCoins] = useState(false);
  const discountAmount = quote?.discount_amount ?? 0;
  const discountPercent = quote?.discount_percent ?? 0;
  const afterDiscount = quote ? quote.total : subtotal;
  const maxCoins = Math.min(
    wallet?.balance ?? 0,
    quote?.max_coins ?? Math.floor(subtotal * MAX_COIN_SHARE),
  );
  const coinsToSpend = useCoins ? maxCoins : 0;
  const payableTotal = afterDiscount - coinsToSpend;

  // Alert user if some items were filtered
  React.useEffect(() => {
    if (items.length > validItems.length) {
      Alert.alert(
        t("common.warning", "Warning"),
        t(
          "checkout.ownDishesRemoved",
          "Your own dishes have been removed from checkout.",
        ),
      );
    }
  }, [validItems.length]);

  const selectedAddress = addresses.find(
    (a) => a.address_id === selectedAddressId,
  );

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      Alert.alert(
        t("checkout.selectAddress"),
        t("checkout.selectAddressDescription"),
      );
      return;
    }

    // Серверный расчёт не прошёл (повар закрылся / оффер снят) —
    // локальная сумма не совпадёт с интентом, оплату не пускаем
    if (quoteDto && !quote) {
      const data = (quoteError as any)?.response?.data;
      Alert.alert(
        t("common.error"),
        data?.code === "chef_closed"
          ? t("checkout.chefClosed")
          : (data?.message ?? t("checkout.quoteFailed")),
      );
      return;
    }

    if (validItems.length === 0) {
      Alert.alert(
        t("checkout.emptyCart", "Cart is empty"),
        t("checkout.addItemsFirst", "Please add items to your cart first"),
      );
      return;
    }

    navigation.navigate("Payment", {
      addressId: selectedAddressId,
      totalAmount: payableTotal,
      coinsToSpend,
    });
  };

  const handleAddAddress = () => {
    navigation.navigate("AddressManagement", { mode: "select" });
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("checkout.title", "Checkout")} backButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {t("checkout.orderSummary")}
          </Text>

          {validItems.map((item) => (
            <View key={item.dish.dish_id} style={styles.itemRow}>
              <Text style={[styles.itemName, { color: c.text }]}>
                {item.quantity}x {item.dish.name}
              </Text>
              <Text style={[styles.itemPrice, { color: c.textSecondary }]}>
                {(Number(item.dish.price) * item.quantity).toLocaleString()} ₸
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          {discountAmount > 0 && (
            <View style={styles.itemRow}>
              <View style={styles.coinsLabelWrap}>
                <Ionicons name="compass-outline" size={16} color={c.info} />
                <Text style={[styles.itemName, { color: c.info }]}>
                  {t("checkout.pioneerDiscount", { percent: discountPercent })}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: c.info }]}>
                −{discountAmount.toLocaleString()} ₸
              </Text>
            </View>
          )}

          {(quote?.delivery_fee ?? 0) > 0 && (
            <View style={styles.itemRow}>
              <View style={styles.coinsLabelWrap}>
                <Ionicons name="bicycle-outline" size={16} color={c.textSecondary} />
                <Text style={[styles.itemName, { color: c.textSecondary }]}>
                  {t("checkout.deliveryFee")}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: c.textSecondary }]}>
                +{Number(quote!.delivery_fee).toLocaleString()} ₸
              </Text>
            </View>
          )}

          {maxCoins > 0 && (
            <View style={styles.itemRow}>
              <View style={styles.coinsLabelWrap}>
                <Ionicons name="server-outline" size={16} color={c.primary} />
                <Text style={[styles.itemName, { color: c.text }]}>
                  {t("checkout.useCoins", { count: maxCoins })}
                </Text>
              </View>
              <Switch
                value={useCoins}
                onValueChange={setUseCoins}
                trackColor={{ true: c.primary }}
              />
            </View>
          )}

          {coinsToSpend > 0 && (
            <View style={styles.itemRow}>
              <Text style={[styles.itemName, { color: c.success }]}>
                {t("checkout.coinsDiscount")}
              </Text>
              <Text style={[styles.itemPrice, { color: c.success }]}>
                −{coinsToSpend.toLocaleString()} ₸
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: c.text }]}>
              {t("checkout.total")}
            </Text>
            <Text style={[styles.totalValue, { color: c.primary }]}>
              {payableTotal.toLocaleString()} ₸
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              {t("checkout.deliveryAddress")}
            </Text>
            <TouchableOpacity onPress={handleAddAddress}>
              <Ionicons name="add-circle" size={24} color={c.primary} />
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                {t("checkout.noAddresses")}
              </Text>
              <Button
                title={t("checkout.addAddress")}
                onPress={handleAddAddress}
                size="sm"
              />
            </View>
          ) : (
            addresses.map((address) => (
              <TouchableOpacity
                key={address.address_id}
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: c.surface,
                    borderColor:
                      selectedAddressId === address.address_id
                        ? c.primary
                        : c.border,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedAddressId(address.address_id)}
              >
                <View style={styles.addressContent}>
                  <Ionicons
                    name={
                      selectedAddressId === address.address_id
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={
                      selectedAddressId === address.address_id
                        ? c.primary
                        : c.textMuted
                    }
                  />
                  <View style={styles.addressInfo}>
                    <Text style={[styles.addressLine, { color: c.text }]}>
                      {address.street}
                    </Text>
                    {address.city && (
                      <Text
                        style={[styles.addressLine, { color: c.textSecondary }]}
                      >
                        {address.city}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[
          styles.footer,
          { backgroundColor: c.surface, borderTopColor: c.border },
        ]}
      >
        <Button
          title={t("checkout.proceedToPayment")}
          onPress={handleProceedToPayment}
          fullWidth
          size="lg"
          disabled={!selectedAddressId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100, paddingTop: 20 },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  coinsLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  itemName: { fontSize: 15, flex: 1 },
  itemPrice: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, marginVertical: 16 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 18, fontWeight: "600" },
  totalValue: { fontSize: 24, fontWeight: "800" },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addressContent: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  addressInfo: { flex: 1 },
  addressLine: { fontSize: 15, marginBottom: 4 },
  addressCity: { fontSize: 14, marginTop: 4 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: { fontSize: 15, textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
});
