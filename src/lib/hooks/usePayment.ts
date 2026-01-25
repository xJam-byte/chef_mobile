import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentApi, PaymentMethod } from '../api/payment';

/**
 * Create payment intent hook
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: ({ amount, currency }: { amount: number; currency?: string }) =>
      paymentApi.createIntent(amount, currency),
  });
}

/**
 * Confirm payment hook
 */
export function useConfirmPayment() {
  return useMutation({
    mutationFn: ({ intentId, method }: { intentId: string; method: PaymentMethod }) =>
      paymentApi.confirmPayment(intentId, method),
  });
}

/**
 * Get payment status hook
 */
export function usePaymentStatus(intentId: string | null) {
  return useQuery({
    queryKey: ['payment', 'status', intentId],
    queryFn: () => paymentApi.getPaymentStatus(intentId!),
    enabled: !!intentId,
  });
}
