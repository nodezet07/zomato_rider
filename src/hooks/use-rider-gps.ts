import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type RiderGpsCoord = {
  latitude: number;
  longitude: number;
  heading?: number;
} | null;

/** Live rider GPS for map arrow marker. */
export function useRiderGps(enabled = true): RiderGpsCoord {
  const [coord, setCoord] = useState<RiderGpsCoord>(null);

  useEffect(() => {
    if (!enabled) {
      setCoord(null);
      return;
    }

    let sub: Location.LocationSubscription | null = null;
    let alive = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !alive) return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => null);
      if (current && alive) {
        setCoord({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          heading: current.coords.heading ?? undefined,
        });
      }

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 15,
          timeInterval: 8_000,
        },
        (loc) => {
          if (!alive) return;
          setCoord({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading: loc.coords.heading ?? undefined,
          });
        },
      );
    })();

    return () => {
      alive = false;
      sub?.remove();
    };
  }, [enabled]);

  return coord;
}
