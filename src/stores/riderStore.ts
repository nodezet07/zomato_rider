import { create } from 'zustand';

import type { RiderProfile } from '@/types/rider';

type RiderState = {
  rider: RiderProfile | null;
  setRider: (rider: RiderProfile | null) => void;
  clearRider: () => void;
};

export const useRiderStore = create<RiderState>((set) => ({
  rider: null,
  setRider: (rider) => set({ rider }),
  clearRider: () => set({ rider: null }),
}));
