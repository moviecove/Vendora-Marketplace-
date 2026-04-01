// Paystack Payment Utilities

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: Record<string, any>;
  callback: (response: any) => void;
  onClose?: () => void;
}

export function initializePaystackPayment(config: PaystackConfig) {
  const PaystackPop = (window as any).PaystackPop;

  if (!PaystackPop) {
    throw new Error('Paystack script not loaded. Please add the Paystack script to your HTML.');
  }

  const handler = PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo
    currency: config.currency || 'NGN',
    ref: config.ref || `tx_${Date.now()}`,
    metadata: config.metadata,
    callback: config.callback,
    onClose: config.onClose,
  });

  handler.openIframe();
}

export function calculateSplit(amount: number) {
  const sellerAmount = amount * 0.8; // 80% to seller
  const platformAmount = amount * 0.2; // 20% to platform

  return {
    sellerAmount,
    platformAmount,
    total: amount,
  };
}

export function verifyPaystackTransaction(reference: string, secretKey: string) {
  return fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  }).then((res) => res.json());
}

export const BOOST_DURATIONS = {
  '24h': { hours: 24, label: '24 Hours', price: 1000 },
  '3d': { hours: 72, label: '3 Days', price: 2500 },
  '7d': { hours: 168, label: '7 Days', price: 5000 },
} as const;

export function calculateBoostExpiry(duration: keyof typeof BOOST_DURATIONS): Date {
  const now = new Date();
  const config = BOOST_DURATIONS[duration];
  return new Date(now.getTime() + config.hours * 60 * 60 * 1000);
}

export function isBoostActive(boostExpiry: string | null): boolean {
  if (!boostExpiry) return false;
  return new Date(boostExpiry) > new Date();
}
