import { create } from 'zustand';

export type DeliveryOffer = {
  orderId: string;
  orderNumber: string;
  restaurantName: string;
  grandTotal: number;
  expiresAt: number;
};

type DeliveryOfferState = {
  offer: DeliveryOffer | null;
  showOffer: (input: Omit<DeliveryOffer, 'expiresAt'> & { acceptTimeoutSeconds?: number }) => void;
  clearOffer: (orderId?: string) => void;
};

export const useDeliveryOfferStore = create<DeliveryOfferState>((set, get) => ({
  offer: null,
  showOffer: (input) => {
    const timeoutSec = input.acceptTimeoutSeconds ?? 45;
    const next: DeliveryOffer = {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      restaurantName: input.restaurantName,
      grandTotal: input.grandTotal,
      expiresAt: Date.now() + timeoutSec * 1000,
    };
    const current = get().offer;
    if (current && current.orderId === next.orderId) return;
    set({ offer: next });
  },
  clearOffer: (orderId) => {
    const current = get().offer;
    if (!current) return;
    if (orderId && current.orderId !== orderId) return;
    set({ offer: null });
  },
}));
