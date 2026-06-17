/** Rider delivery status steps (manual enum updates — maps later) */

export type RiderDeliveryStatus =
  | 'READY_FOR_PICKUP'
  | 'RIDER_ASSIGNED'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED';

export const RIDER_STATUS_LABELS: Record<string, string> = {
  READY_FOR_PICKUP: 'Ready for pickup',
  RIDER_ASSIGNED: 'Assigned — go to restaurant',
  PICKED_UP: 'Picked up from restaurant',
  ON_THE_WAY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export type DeliveryStep = {
  status: RiderDeliveryStatus;
  label: string;
  description: string;
};

export const DELIVERY_FLOW_STEPS: DeliveryStep[] = [
  {
    status: 'RIDER_ASSIGNED',
    label: 'At restaurant',
    description: 'Head to the restaurant and collect the order',
  },
  {
    status: 'PICKED_UP',
    label: 'Picked up',
    description: 'Confirm you collected the order from the restaurant',
  },
  {
    status: 'ON_THE_WAY',
    label: 'On the way',
    description: 'Start delivery to the customer address',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    description: 'Confirm handover to the customer',
  },
];

export type RiderDeliveryAction = 'pickup' | 'start' | 'complete' | 'reject';

export function nextRiderAction(status: string): RiderDeliveryAction | null {
  if (status === 'RIDER_ASSIGNED' || status === 'READY_FOR_PICKUP') return 'pickup';
  if (status === 'PICKED_UP') return 'start';
  if (status === 'ON_THE_WAY') return 'complete';
  return null;
}

export function actionButtonLabel(action: RiderDeliveryAction): string {
  switch (action) {
    case 'pickup':
      return 'Picked up from restaurant';
    case 'start':
      return 'Start delivery';
    case 'complete':
      return 'Complete delivery';
    case 'reject':
      return 'Release order';
    default:
      return 'Update status';
  }
}

export function stepIndexForStatus(status: string): number {
  if (status === 'RIDER_ASSIGNED' || status === 'READY_FOR_PICKUP') return 0;
  if (status === 'PICKED_UP') return 1;
  if (status === 'ON_THE_WAY') return 2;
  if (status === 'DELIVERED') return 3;
  return -1;
}
