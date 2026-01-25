import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button } from "../../components/ui";
import { useColors } from "../../lib/theme";
import {
  useCreatePaymentIntent,
  useConfirmPayment,
  useCreateOrder,
  useCart,
  useProfile,
} from "../../lib/hooks";
import { showMessage } from "react-native-flash-message";

type PaymentMethodType = "card" | "cash" | "online";

export default function PaymentScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addressId, totalAmount } = route.params;

  const { data: profile } = useProfile();
  const { items, clearCart } = useCart();
  const createIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();
  const createOrder = useCreateOrder();

  const [intentId, setIntentId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("card");
  const [processing, setProcessing] = useState(false);

  // Create payment intent on mount
  useEffect(() => {
    createIntent.mutate(
      { amount: totalAmount, currency: "KZT" },
      {
        onSuccess: (data) => {
          setIntentId(data.intentId);
        },
        onError: () => {
          showMessage({
            message: t("payment.error"),
            description: t("payment.errorCreatingIntent"),
            type: "danger",
          });
          navigation.goBack();
        },
      }
    );
  }, []);

  const handlePayment = async () => {
    if (!intentId) return;

    setProcessing(true);

    try {
      // 1. Confirm payment
      const paymentResult = await confirmPayment.mutateAsync({
        intentId,
        method: {
          type: selectedMethod,
          cardLast4: selectedMethod === "card" ? "4242" : undefined,
          cardBrand: selectedMethod === "card" ? "Visa" : undefined,
        },
      });
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Payment failed");
      }

      // 2. Create order with payment info
      const orderData = {
        userId: profile!.user_id,
        total_price: totalAmount,
        status: "pending" as const,
        delivery_address_id: addressId,
        payment_method: selectedMethod,
        payment_intent_id: intentId,
        items: items.map((item) => ({
          dishId: item.dish.dish_id,
          quantity: item.quantity,
          preferences: item.preferences,
          price: Number(item.dish.price),
        })),
      };
      
      console.log("[createOrder] payload:", JSON.stringify(orderData, null, 2));
      await createOrder.mutateAsync(orderData);

      // 3. Clear cart
      clearCart();

      // 4. Show success
      showMessage({
        message: t("payment.success"),
        description: t("payment.orderPlaced"),
        type: "success",
        duration: 3000,
      });

      // 5. Navigate to profile (where orders history is accessible)
      navigation.reset({
        index: 0,
        routes: [{ name: "Main", params: { screen: "Profile" } }],
      });
    } catch (error: any) {
      showMessage({
        message: t("payment.error"),
        description: error.message || t("payment.errorProcessing"),
        type: "danger",
      });
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods: { type: PaymentMethodType; icon: string; label: string }[] = [
    { type: "card", icon: "card", label: t("payment.card") },
    { type: "cash", icon: "cash", label: t("payment.cash") },
    { type: "online", icon: "globe", label: t("payment.online") },
  ];

  if (createIntent.isPending || !intentId) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c.textSecondary }]}>
          {t("payment.preparing")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.content}>
        {/* Amount Display */}
        <View style={[styles.amountCard, { backgroundColor: c.card }]}>
          <Text style={[styles.amountLabel, { color: c.textSecondary }]}>
            {t("payment.totalAmount")}
          </Text>
          <Text style={[styles.amountValue, { color: c.text }]}>
            {totalAmount.toLocaleString()} ₸
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          <Text style={[styles.methodsTitle, { color: c.text }]}>
            {t("payment.selectMethod")}
          </Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.type}
              style={[
                styles.methodCard,
                {
                  backgroundColor: c.card,
                  borderColor: selectedMethod === method.type ? c.primary : c.border,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedMethod(method.type)}
            >
              <Ionicons
                name={method.icon as any}
                size={24}
                color={selectedMethod === method.type ? c.primary : c.textMuted}
              />
              <Text
                style={[
                  styles.methodLabel,
                  { color: selectedMethod === method.type ? c.text : c.textSecondary },
                ]}
              >
                {method.label}
              </Text>
              <Ionicons
                name={
                  selectedMethod === method.type
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={selectedMethod === method.type ? c.primary : c.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Stub Notice */}
        <View style={[styles.notice, { backgroundColor: c.primary + "15" }]}>
          <Ionicons name="information-circle" size={20} color={c.primary} />
          <Text style={[styles.noticeText, { color: c.primary }]}>
            {t("payment.stubNotice")}
          </Text>
        </View>
      </View>

      {/* Pay Button */}
      <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border }]}>
        <Button
          title={processing ? t("payment.processing") : t("payment.pay")}
          onPress={handlePayment}
          loading={processing}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  amountCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountLabel: { fontSize: 16, marginBottom: 8 },
  amountValue: { fontSize: 36, fontWeight: "800" },
  methodsSection: { marginBottom: 24 },
  methodsTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  methodLabel: { flex: 1, fontSize: 16, fontWeight: "600" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  noticeText: { flex: 1, fontSize: 13, fontWeight: "600" },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
