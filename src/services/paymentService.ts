import { delay } from './api';

interface PaymentData {
  method: 'gcash' | 'card' | 'cash';
  amount: number;
  bookingId: string;
  gcashNumber?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

// Replace with real API call: axios.post('/api/payments/process', data)
export async function processPayment(data: PaymentData): Promise<{ success: boolean; transactionId: string }> {
  await delay(1000);
  if (data.method === 'card' && data.cardNumber?.replace(/\s/g, '').startsWith('0000')) {
    throw new Error('Card declined. Please try a different payment method.');
  }
  return {
    success: true,
    transactionId: `txn-${Date.now()}`,
  };
}
