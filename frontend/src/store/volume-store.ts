import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VolumeStore {
  volume: number;
  setVolume: (v: number) => void;
}

export const useVolumeStore = create<VolumeStore>()(
  persist(
    (set) => ({
      volume: 50,
      setVolume: (v) => set({ volume: v }),
    }),
    { name: 'video-volume' }
  )
); 