// @ts-nocheck
import { create } from 'zustand';

// phase: 1 = customizing, '2a' = side view treadmill, '2b' = walking off, 3 = welcome
export const useStore = create((set) => ({
  phase: 1,
  hoodieColor: '#4A3F6B',
  // Walk controls
  overdrive: 56,
  armSpace: 51,
  trimStart: -50,
  trimEnd: 150,
  mirror: true,
  inPlace: true,
  // Transform controls
  scale: 0.016,
  posY: 0.08,
  // Side view camera distance (phase 2a/2b)
  sideViewDist: 4.5,
  setPhase: (phase) => set({ phase }),
  setHoodieColor: (hoodieColor) => set({ hoodieColor }),
  setOverdrive: (overdrive) => set({ overdrive }),
  setArmSpace: (armSpace) => set({ armSpace }),
  setTrim: (trimStart, trimEnd) => set({ trimStart, trimEnd }),
  setMirror: (mirror) => set({ mirror }),
  setInPlace: (inPlace) => set({ inPlace }),
  setScale: (scale) => set({ scale }),
  setPosY: (posY) => set({ posY }),
  setSideViewDist: (sideViewDist) => set({ sideViewDist }),
}));
