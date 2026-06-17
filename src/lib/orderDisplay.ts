import type { RiderOrder } from '@/types/rider';

export function formatDeliveryAddress(order: RiderOrder): string {
  const addr = order.customerAddress ?? order.deliveryAddress;
  if (order.customerAddress?.fullAddress) return order.customerAddress.fullAddress;
  return [addr?.street, addr?.city, addr?.pincode].filter(Boolean).join(', ') || 'Address on file';
}

export function formatRestaurantAddress(order: RiderOrder): string {
  const restaurant = order.restaurantId;
  if (typeof restaurant !== 'object' || !restaurant) return 'Address on file';
  const addr = restaurant.address;
  if (addr && typeof addr === 'object') {
    const line = [addr.street, addr.city].filter(Boolean).join(', ');
    if (line) return line;
  }
  return 'Restaurant address on file';
}

export function orderDisplayId(order: RiderOrder): string {
  return `#${order.orderNumber ?? order._id.slice(-6).toUpperCase()}`;
}

export function itemCount(order: RiderOrder): number {
  const items = order.items ?? order.orderItems ?? [];
  return items.reduce((sum, i) => sum + (i.quantity ?? 1), 0);
}

export function pickRestaurantCoord(order: RiderOrder): { latitude: number; longitude: number } | null {
  const restaurant = order.restaurantId;
  if (!restaurant || typeof restaurant !== 'object') return null;
  const r = restaurant as {
    latitude?: number;
    longitude?: number;
    location?: { coordinates?: number[] };
  };
  if (Number.isFinite(r.latitude) && Number.isFinite(r.longitude)) {
    return { latitude: r.latitude!, longitude: r.longitude! };
  }
  const coords = r.location?.coordinates;
  if (coords && coords.length >= 2) {
    return { latitude: coords[1]!, longitude: coords[0]! };
  }
  return null;
}

export function pickCustomerCoord(order: RiderOrder): { latitude: number; longitude: number } | null {
  const addr = order.customerAddress ?? order.deliveryAddress;
  if (!addr) return null;
  const lat = Number(addr.latitude);
  const lng = Number(addr.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }
  return null;
}
