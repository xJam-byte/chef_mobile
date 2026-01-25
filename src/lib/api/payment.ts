import { apiClient } from "./client";

export interface PaymentIntent {
  intentId: string;
  amount: number;
  currency: string;
  clientSecret?: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  createdAt: Date;
}

export interface PaymentMethod {
  type: 'card' | 'cash' | 'online';
  cardLast4?: string;
  cardBrand?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'succeeded' | 'failed' | 'pending';
  message?: string;
  receiptUrl?: string;
}

export const paymentApi = {
  /**
   * Create a payment intent
   */
  async createIntent(amount: number, currency: string = 'KZT'): Promise<PaymentIntent> {
    const response = await apiClient.post('/payment/intent', { amount, currency });
    return response.data;
  },

  /**
   * Confirm payment
   */
  async confirmPayment(intentId: string, method: PaymentMethod): Promise<PaymentResult> {
    const response = await apiClient.post('/payment/confirm', { intentId, method });
    return response.data;
  },

/**
   * Get payment status
   */
  async getPaymentStatus(intentId: string): Promise<PaymentIntent> {
    const response = await apiClient.get(`/payment/status/${intentId}`);
    return response.data;
  },
};
