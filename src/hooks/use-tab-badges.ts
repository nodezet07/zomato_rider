import { useQuery } from '@tanstack/react-query';

import { fetchAvailableOrders } from '@/services/riders';
import { useRiderStore } from '@/stores/riderStore';

export function useTabBadges() {
  const rider = useRiderStore((s) => s.rider);

  const availableQ = useQuery({
    queryKey: ['rider', 'available-orders'],
    queryFn: fetchAvailableOrders,
    enabled: Boolean(rider?.onlineStatus) && !rider?.currentOrderId,
    refetchInterval: rider?.onlineStatus && !rider?.currentOrderId ? 15000 : false,
  });

  const jobCount = rider?.currentOrderId
    ? 0
    : (availableQ.data ?? []).filter((o) => o._id !== rider?.currentOrderId).length;

  return {
    jobCount,
    hasActiveTrip: Boolean(rider?.currentOrderId),
  };
}
