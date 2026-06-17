import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import { updateRiderLocation } from '@/services/riders';

export const RIDER_LOCATION_TASK = 'rider-background-location';

TaskManager.defineTask(RIDER_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;

  const locations = (data as { locations?: Location.LocationObject[] })?.locations;
  const loc = locations?.[0];
  if (!loc) return;

  try {
    await updateRiderLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      speed: loc.coords.speed ?? undefined,
      heading: loc.coords.heading ?? undefined,
    });
  } catch {
    // ignore transient network errors
  }
});
