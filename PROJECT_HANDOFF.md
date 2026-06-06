# PROJECT HANDOFF — Catwalk Mannequin Customizer

A complete handoff document for any developer or AI continuing this project with zero prior context. Read top to bottom.

---

## 1. Project Overview

**What it is:** A 3D fashion-show / "catwalk" web experience. A rigged GLB mannequin walks on a treadmill loop in the browser. The user can:

1. Customize a hoodie color and tweak the walk animation (speed, arm-space, scale, vertical position, mirror, in-place) in **Phase 1**.
2. Click **Complete** to transition into **Phase 2A** — a side-profile view where the mannequin keeps walking in place.
3. Click **Complete** again to trigger **Phase 2B** — the mannequin walks off the right edge of the screen.
4. Land on **Phase 3** — a faded-in "Welcome Aboard" screen.

The cinematic transitions (camera moves, walk-off translation, fade) are driven by **GSAP**. All UI state is in **Zustand**. The 3D scene never remounts between phases — the AnimationMixer runs continuously.

### Tech stack

| Layer | Choice |
|---|---|
| Framework | **TanStack Start v1** (file-based routing in `src/routes/`) |
| Build | **Vite 7** |
| UI | **React 19**, **TypeScript** (strict) |
| 3D rendering | **three**, **@react-three/fiber**, **@react-three/drei** (`useGLTF`, `useAnimations`, `PerspectiveCamera`) |
| Animation/transitions | **gsap** |
| State management | **zustand** |
| Styling | **Tailwind CSS v4** via `src/styles.css` (semantic tokens in `oklch`) |
| UI primitives | **shadcn/ui** (`src/components/ui/*`) |
| Backend | None yet |

### Installed libraries (key ones)

See `package.json` for exact versions. Important ones:

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `gsap`
- `zustand`
- `@tanstack/react-router`, `@tanstack/react-start`
- `tailwindcss` v4
- `lucide-react` (icons)

---

## 2. File Structure

### Created / modified files

| Path | Purpose |
|---|---|
| `src/store/useStore.ts` | Zustand store. Single source of truth for phase, hoodie color, all walk controls, scale, posY. |
| `src/components/MannequinScene.tsx` | The Three.js `<Canvas>`. Loads `/mannequin.glb`, plays animations, applies transform/mirror/in-place, runs GSAP camera + walk-off timelines, fades canvas on Phase 3. |
| `src/components/CustomizationPanel.tsx` | Right-side glass panel with hoodie swatches + "Catwalk Walk Forward" controls (sliders, range slider, checkboxes). Also renders the circle Back/Complete buttons during Phase 2A/2B. |
| `src/components/WelcomeScreen.tsx` | Fades in over the canvas during Phase 3. "Welcome Aboard" centered text on lavender background. |
| `src/routes/index.tsx` | Home route. Mounts `<MannequinScene/>`, `<CustomizationPanel/>`, `<WelcomeScreen/>`. Loads Plus Jakarta Sans font. |
| `src/routes/__root.tsx` | TanStack Start root layout (HTML shell). |
| `src/styles.css` | Tailwind v4 entry + semantic design tokens. |
| `public/mannequin.glb` | The rigged + animated mannequin model. First animation track auto-plays. |
| `PROJECT_CONTEXT.md` | Earlier handoff doc (still valid; superseded by this file in detail). |
| `PROJECT_HANDOFF.md` | This document. |

### Untouched scaffolding

- `src/components/ui/*` — shadcn/ui primitives, unused so far but available.
- `src/router.tsx`, `src/server.ts`, `src/start.ts` — TanStack Start bootstrap. Do NOT edit.
- `src/routeTree.gen.ts` — auto-generated, never edit.

---

## 3. Phase System

State lives in `useStore().phase`. Type: `1 | '2a' | '2b' | 3`.

### Phase 1 — Customizing (`phase === 1`)

- **Default phase on load.**
- Camera at front view: `(0, 1.5, 4)` looking at `(0, 1, 0)`.
- Mannequin rotation `y = 0` (facing camera), position `(0, posY, 0)`.
- `CustomizationPanel` shows the hoodie color swatches + walk-controls panel on the right.
- Clicking **Complete** in the hoodie panel calls `setPhase('2a')`.

### Phase 2A — Side View Treadmill (`phase === '2a'`)

- **Entry:** GSAP tweens the camera from `(0, 1.5, 4)` to `(-2.6, 1.4, 0)` over 0.9s (`power2.inOut`). The camera continues to `lookAt(0, 1, 0)` every frame, so the mannequin slides into a right-side-profile view (nose pointing toward positive X / right edge).
- Mannequin keeps `rotation.y = 0` and `position = (0, posY, 0)`.
- Animation mixer keeps running — mannequin walks in place (treadmill effect from `inPlace: true`).
- **Holds indefinitely** until the user clicks a button.
- UI: a circle **Back ←** button (left side) and a circle **Complete ✓** button (right side, fades in over 600ms).
- Back → `setPhase(1)`. Complete → `setPhase('2b')`.

### Phase 2B — Walk Off (`phase === '2b'`)

- Camera stays at the side-view position.
- A GSAP timeline tweens the mannequin's `position.x` from `0` → `16` over **2.6 seconds**, ease `none` (linear), so it walks straight off the right edge.
- Back button still visible; Complete button hidden (opacity 0, pointer-events none).
- On timeline complete → `setPhase(3)`.

### Phase 3 — Welcome (`phase === 3`)

- A GSAP tween fades the `<Canvas>` wrapper opacity from `1` → `0` over 0.9s (`power2.inOut`).
- `WelcomeScreen` fades in on top: centered "Welcome Aboard" headline + subline, lavender `#F0EEF5` background, thin/light Plus Jakarta Sans typography.
- Currently a terminal state (no exit transition wired).

---

## 4. The 3D Model

- **File:** `public/mannequin.glb` (served at `/mannequin.glb`).
- **Loader:** `useGLTF('/mannequin.glb', true)` from `@react-three/drei`. The second arg `true` enables **DRACO compression** — drei auto-instantiates a `DRACOLoader` pointing at the bundled wasm decoder, no manual setup needed.
- **Preload:** `useGLTF.preload('/mannequin.glb', true)` at module scope so the GLB starts downloading before the component mounts.
- **AnimationMixer:** Provided by `useAnimations(animations, scene)` from drei. It returns an `actions` map keyed by clip name.
- **Active clip:** The **first** animation clip in the GLB (`animations[0].name`) is the one played. All available clip names are logged to the console on load (`console.log('Animations:', ...)`).
- **Playback:** On mount, `actions[firstName].reset().play()` is called and the resulting action is cached in `currentActionRef`. The mixer is **never stopped or recreated** across phase changes, which is what keeps the walk smooth through transitions.
- **Speed:** `currentActionRef.current.timeScale = overdrive / 50` — so `overdrive = 50` is 1× speed, default `56` is slightly faster.
- **Treadmill (in-place) effect:** On load, every animation clip is scanned for `position` tracks belonging to root bones (bones with no bone parent, plus the scene root). The original tracks are cached in `originalRootTracksRef`. When `inPlace === true`, those position tracks are **stripped** from each clip (`clip.tracks = clip.tracks.filter(...)`), so the rig animates in place. When toggled off, the cached tracks are pushed back in. After a toggle, the first clip is `reset().play()` to apply the new track list.

---

## 5. Camera System

A `<PerspectiveCamera fov={45} makeDefault />` lives inside the `<Canvas>` via the internal `CameraRig` component. A `ref` (`camRef`) holds the live three.js camera so GSAP can tween it.

| Phase | Position | LookAt |
|---|---|---|
| 1 | `(0, 1.5, 4)` | `(0, 1, 0)` |
| 2A | `(-2.6, 1.4, 0)` | `(0, 1, 0)` |
| 2B | `(-2.6, 1.4, 0)` (unchanged) | `(0, 1, 0)` |
| 3 | (camera fades out with canvas) | — |

**Transition:** A `useEffect` on `phase` calls `gsap.to(camRef.current.position, { ...target, duration: 0.9, ease: 'power2.inOut' })`. `useFrame` then calls `camRef.current.lookAt(0, 1, 0)` every frame so the camera always tracks the mannequin's torso while it slides into position.

---

## 6. Mannequin Positioning & Rotation

The mannequin is wrapped in a `<group ref={groupRef}>`. All transforms are applied to that group.

### Rotation

- Phase 1: `rotation.y = 0` (front-facing).
- Phase 2A: `rotation.y = 0` (still front-facing in model space — the **camera** is what moves to the side; the mannequin's nose ends up pointing toward the screen-right because the camera is now on the left at `x = -2.6`).
- Phase 2B: rotation unchanged.

GSAP tweens `rotation.y` over 0.8s on phase change as a safety reset.

### Position

- Phase 1 & 2A: `position = (0, posY, 0)` where `posY` defaults to `-0.31` (a slider value).
- Phase 2B: a GSAP timeline tweens `position.x` from current → `16` over 2.6s linear. `y` and `z` are left as-is. On complete → `setPhase(3)`.

### Scale & mirror

- Uniform scale, default `0.015` (the GLB is authored very large).
- In Phase 1: `scale.set(mirror ? -scale : scale, scale, scale)` — X flipped when `mirror === true`.
- In Phase 2A/2B: the X flip is suppressed so true uniform scale is used (`scale.set(scale, scale, scale)`), which keeps the side-profile rotation clean.

### Arm-space

A `useEffect` on `armSpace` traverses the rig and scales any bone whose name contains `arm`, `shoulder`, or `clavicle` by `0.6 + (armSpace / 100) * 0.8`.

### Phase change cleanup

Before applying a new tween, the effect kills existing GSAP tweens on `group.position`, `group.rotation`, and the active `exitTimeline.current` to prevent overlap.

---

## 7. UI Components

### Hoodie panel (Phase 1)

- Right side, `fixed right-8 top-1/2 -translate-y-1/2`.
- Glassmorphic: `bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rounded-2xl`.
- 4 color swatches (`#7C3AED`, `#0AB8BD`, `#F97316`, `#1A1A2E`). Selected swatch gets a `#2D1B4E` border.
- "Complete" pill button (`bg-#2D1B4E text-white`) → `setPhase('2a')`.

### Walk controls panel (Phase 1)

- Below the hoodie panel. White card with sliders for Overdrive, Character Arm-Space, Scale, Vertical Position. A dual-thumb Trim range slider. Checkboxes for Mirror and In Place. X button to collapse.

### Circle buttons (Phase 2A / 2B)

| Button | Position | Visible in | Style | onClick |
|---|---|---|---|---|
| **Back ←** | `fixed left-8 top-1/2 -translate-y-1/2` | 2A and 2B | `w-14 h-14 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xl`, text `#2D1B4E`, 2xl font-light arrow | `setPhase(1)` |
| **Complete ✓** | `fixed right-8 top-1/2 -translate-y-1/2` | 2A only (opacity 0 in 2B, pointer-events disabled) | `w-14 h-14 rounded-full bg-#2D1B4E text-white shadow-xl`, fades in/out over 600ms | `setPhase('2b')` |

Both use Plus Jakarta Sans, sit at `z-10` above the canvas.

### Welcome screen (Phase 3)

- Full-screen overlay at `z-20`, background `#F0EEF5`.
- Small "11" mark top-left.
- Centered `<h1>` "Welcome Aboard", `text-6xl font-thin tracking-wide`, color `#2D1B4E`.
- Subline "YOUR CHARACTER HAS BEEN CREATED", `text-sm font-light tracking-widest uppercase`.
- Fades in over 0.5s via inline `transition: opacity`.

---

## 8. State Management

All state lives in **one Zustand store**: `src/store/useStore.ts`. Any component reads/writes via `useStore()`.

### State shape

```ts
{
  phase: 1 | '2a' | '2b' | 3,   // default: 1
  hoodieColor: string,           // default: '#4A3F6B'

  // Walk controls
  overdrive: number,             // 0–100, default 56  (timeScale = overdrive/50)
  armSpace: number,              // 0–100, default 51  (bone scale = 0.6 + v/100*0.8)
  trimStart: number,             // default -50  (stored only, not wired)
  trimEnd: number,               // default 150  (stored only, not wired)
  mirror: boolean,               // default true   (flips X scale)
  inPlace: boolean,              // default true   (strips root position tracks)

  // Transform
  scale: number,                 // 0.001–1 step 0.001, default 0.015
  posY: number,                  // -3 to 3 step 0.01, default -0.31

  // Setters
  setPhase, setHoodieColor, setOverdrive, setArmSpace,
  setTrim(start, end), setMirror, setInPlace, setScale, setPosY,
}
```

The store is consumed in `MannequinScene.tsx` (reads everything, writes `phase` on walk-off complete) and `CustomizationPanel.tsx` (reads + writes all UI controls).

---

## 9. Known Issues / What Still Needs Work

- **Hoodie color is not applied to the mesh.** `hoodieColor` is stored and the swatch UI is wired, but the material override on the actual hoodie mesh in the GLB is not implemented. Needs a scene traversal to find the hoodie mesh and set `material.color`.
- **Trim sliders are not wired.** `trimStart` / `trimEnd` are stored only; nothing clamps the animation clip range yet.
- **Phase 3 has no exit.** Once the welcome screen shows, there is no way back to Phase 1 without a reload.
- **No persistence.** Settings reset on refresh. Would need Lovable Cloud or localStorage.
- **`// @ts-nocheck`** is used in `MannequinScene.tsx` and `CustomizationPanel.tsx` to sidestep `@react-three/fiber` JSX intrinsic typing. Keep it or migrate to proper R3F types.
- **Walk-off distance** is hard-coded to `x = 16`. On ultra-wide screens this may not clear the viewport; consider deriving from viewport width.
- **Lighting is basic** (ambient + directional + rectArea). No shadows, no environment HDR.

---

## 10. How to Run the Project

```bash
# Install
bun install

# Dev server (managed by the Lovable harness in this environment)
bun run dev

# Production build
bun run build
```

- No environment variables are required.
- No backend / database — the app is fully client-side.
- Open the dev URL; the home route `/` mounts the full experience.

**Do not** run `npm run build` manually inside the Lovable harness — the harness handles builds. Outside the harness, standard `bun`/`npm` scripts apply.

---

*End of handoff. Edit `useStore.ts` for state, `MannequinScene.tsx` for 3D behavior, `CustomizationPanel.tsx` for UI controls, `WelcomeScreen.tsx` for the Phase 3 screen.*
