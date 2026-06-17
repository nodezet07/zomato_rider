import type { ComponentType } from 'react';

import { MapErrorBoundary } from '@/components/map/MapErrorBoundary';
import { DeliveryMapFallback, type DeliveryMapProps } from '@/components/delivery-map-fallback';
import { hasNativeMapsModule } from '@/lib/canUseNativeMaps';

export type { DeliveryMapProps };

function hasAnyCoord(props: DeliveryMapProps) {
  return [props.customer, props.restaurant, props.rider].some(
    (c) => c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude),
  );
}

let NativeDeliveryMap: ComponentType<DeliveryMapProps> | null = null;

if (hasNativeMapsModule()) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    NativeDeliveryMap = require('@/components/delivery-map-native').DeliveryMapNative;
  } catch {
    NativeDeliveryMap = null;
  }
}

export function DeliveryMap(props: DeliveryMapProps) {
  if (!hasAnyCoord(props) || !NativeDeliveryMap) {
    return <DeliveryMapFallback {...props} />;
  }
  return (
    <MapErrorBoundary height={props.fullScreen ? undefined : props.height ?? 220}>
      <NativeDeliveryMap {...props} />
    </MapErrorBoundary>
  );
}
