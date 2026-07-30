// @ts-nocheck
import { create } from 'zustand';

// phase: 1 = customizing, '2a' = side view treadmill, '2b' = walking off, 3 = welcome
export const useStore = create((set) => ({
  phase: 1,
  // Per-region mannequin colours (null = keep the model's original material)
  hoodieColor: null,   // CHEST  → hoodie
  trouserColor: null,  // LEGS   → track pants
  bodyColor: null,     // whole body / skin
  // Walk controls
  overdrive: 56,
  armSpace: 51,
  trimStart: -50,
  trimEnd: 150,
  mirror: true,
  inPlace: true,
  // Transform controls
  scale: 0.016,
  posY: -0.31,
  // Side view camera distance (phase 2a/2b)
  sideViewDist: 4.5,
  // Side-view orbit radius (smaller = mannequin appears bigger). Front stays at 4.
  sideZoom: 4.0,
  setPhase: (phase) => set({ phase }),
  setHoodieColor: (hoodieColor) => set({ hoodieColor }),
  setTrouserColor: (trouserColor) => set({ trouserColor }),
  setBodyColor: (bodyColor) => set({ bodyColor }),
  setOverdrive: (overdrive) => set({ overdrive }),
  setArmSpace: (armSpace) => set({ armSpace }),
  setTrim: (trimStart, trimEnd) => set({ trimStart, trimEnd }),
  setMirror: (mirror) => set({ mirror }),
  setInPlace: (inPlace) => set({ inPlace }),
  setScale: (scale) => set({ scale }),
  setPosY: (posY) => set({ posY }),
  setSideViewDist: (sideViewDist) => set({ sideViewDist }),
  setSideZoom: (sideZoom) => set({ sideZoom }),
}));
