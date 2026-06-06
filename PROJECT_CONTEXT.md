# Project Context — Catwalk Mannequin Customizer

A handoff doc for any AI/dev continuing this project. Read this first.

## What this app is
A 3D fashion-show / "catwalk" experience built with **React + TanStack Start + Vite** and **@react-three/fiber + drei** for 3D. A GLB mannequin walks on an animated loop; the user can customize hoodie color and tweak the walk/animation in real time, then trigger a "complete" sequence where the mannequin turns and exits the frame. GSAP drives the cinematic transitions; Zustand holds all UI state.

## Tech stack
- **Framework:** TanStack Start v1 (file-based routes in `src/routes/`, root layout `src/routes/__root.tsx`). Do NOT use `src/pages/`.
- **Build:** Vite 7, React 19, TypeScript (strict).
- **3D:** `three`, `@react-three/fiber`, `@react-three/drei` (`useGLTF`, `useAnimations`, `PerspectiveCamera`).
- **Animation/transitions:** `gsap`.
- **State:** `zustand` (`src/store/useStore.ts`).
- **Styling:** Tailwind CSS v4 via `src/styles.css` (semantic tokens in `oklch`). Use design tokens — avoid hardcoded colors in components.
- **UI primitives:** shadcn/ui under `src/components/ui/*`.
- **Backend:** none yet. Add Lovable Cloud only if persistence/auth is needed.

## Key files
- `src/store/useStore.ts` — single source of truth for app state (phase, hoodie color, walk controls, transform).
- `src/components/MannequinScene.tsx` — Three.js canvas, loads `/public/mannequin.glb`, plays animations, applies scale/mirror/posY, runs GSAP exit timeline.
- `src/components/CustomizationPanel.tsx` — right-side glass panel + "Catwalk Walk Forward" controls panel (sliders + checkboxes).
- `src/components/WelcomeScreen.tsx` — landing/intro screen shown in `welcome` phase.
- `public/mannequin.glb` — the rigged + animated model. First animation track auto-plays.

## App phases (`useStore().phase`)
- `customizing` — user adjusts hoodie color + walk controls. Sliders are live; mannequin stays centered.
- `side_view` — triggered by "Complete". GSAP rotates mannequin 90°, walks it offscreen right, then advances to `welcome`.
- `welcome` — canvas fades out, `WelcomeScreen` is shown.
- `exiting` — alternate exit sequence handled in `MannequinScene`.

## Controls and what they do
| Control | Range | Effect |
|---|---|---|
| Hoodie color swatch | 4 presets | Sets `hoodieColor` (currently informational; material override is not wired) |
| Overdrive | 0–100 | `action.timeScale = overdrive / 50` (50 = 1x speed) |
| Character Arm-Space | 0–100 | Scales bones whose name contains `arm`/`shoulder`/`clavicle` by `0.6 + (v/100)*0.8` |
| **Scale** | **0.001–1, step 0.001** | Uniform group scale. **Default `0.015`**. |
| **Vertical Position** | **-3 to 3, step 0.01** | `group.position.y`. **Default `-0.31`**. Only applied in `customizing`. |
| Trim | -50 to 150 (dual) | Stored only; not yet wired to clip trimming |
| Mirror | bool | Flips X scale (`-scale` on X) |
| In Place | bool | Strips/restores root-bone position tracks so the mannequin walks in place |

## Current defaults (important — do not regress)
These were tuned by the user on a real device. Keep them as the baseline:
```ts
overdrive: 56
armSpace: 51
scale: 0.015      // Scale slider min=0.001, max=1, step=0.001
posY: -0.31       // Vertical Position slider min=-3, max=3, step=0.01
mirror: true
inPlace: true
trimStart: -50, trimEnd: 150
hoodieColor: '#4A3F6B'
phase: 'customizing'
```
The GLB is authored very large in world units, which is why the working scale is ~0.015. Do not change the slider min/max or the defaults without explicit user request.

## Conventions and gotchas
- `MannequinScene.tsx` and `CustomizationPanel.tsx` use `// @ts-nocheck` because of `@react-three/fiber` JSX intrinsic typing. Keep it unless you migrate types.
- The `useEffect` that writes `position.y = posY` is gated on `phase === 'customizing'` so it doesn't fight the GSAP exit timeline.
- The `useEffect` for scale writes `scale.set(mirror ? -scale : scale, scale, scale)` — uniform, with X flipped when mirrored.
- First animation clip in the GLB is auto-played; names are logged to console on load.
- Camera is a `PerspectiveCamera` at `[0, 1.5, 4]`, always `lookAt(0, 1, 0)`.
- Background color: `#F0EEF5` (set on the `<Canvas>`).
- Do NOT introduce `react-router-dom`. Use `@tanstack/react-router`.
- Do NOT create `entry-client.tsx` / `entry-server.tsx` — TanStack Start v1 handles SSR.

## What's not done yet (likely next steps)
- Apply `hoodieColor` to the actual mannequin material (find the hoodie mesh and override its `material.color`).
- Wire `trimStart`/`trimEnd` to actually clamp the animation clip.
- Persist user settings (would need Lovable Cloud).
- Polish `WelcomeScreen` post-exit transition.

## How to run / where to look
- Dev server is managed by the Lovable harness; do not run `npm run build` manually.
- Routes: `src/routes/index.tsx` is the home page and mounts `MannequinScene` + `CustomizationPanel`.
- When changing 3D behavior, edit `MannequinScene.tsx`. When changing UI, edit `CustomizationPanel.tsx`. When changing defaults or adding state, edit `useStore.ts`.
