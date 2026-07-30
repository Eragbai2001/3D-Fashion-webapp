// @ts-nocheck
import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

// Classify a mesh into a customizable region by material (and mesh) name.
// GLB material groups (verified against the GLB):
//   hoodie  → "hoodie_*"  only                                (upper garment)
//   trouser → "FABRIC 2_*" + "Fabric19…/195…_*" + "Material19…" trims (track pants)
//   body    → "Material21…"  (base_female mesh)
function regionOf(meshName, matName) {
  const nn = (meshName || '').toLowerCase();
  const mn = (matName  || '').toLowerCase();
  if (mn.includes('hoodie'))                             return 'hoodie';
  if (mn.includes('fabric')  || /^material19/.test(mn))  return 'trouser';
  if (/^material21/.test(mn) || nn.startsWith('base_female')) return 'body';
  return null;
}

function Mannequin({ groupRef }) {
  const { phase, setPhase, scale, posY, mirror, hoodieColor, trouserColor, bodyColor } = useStore();
  const regionMats = useRef({ hoodie: [], trouser: [], body: [] });
  const exitTimeline = useRef(null);
  const idleTimeline = useRef(null);

  const gltf = useGLTF('/mannequin.glb') as any;
  const scene = gltf.scene;
  const animations = gltf.animations ?? [];
  const { actions } = useAnimations(animations, scene);

  // Treadmill effect: strip forward/sideways root drift so the mannequin walks
  // in place. Keep the vertical bob (Y) for a natural stride.
  useEffect(() => {
    if (!animations.length || !scene) return;
    // Root bones = bones with no bone parent (mixamo: "mixamorigHips"), + scene root
    const rootNames = new Set<string>();
    scene.traverse((o: any) => {
      if (o.isBone && (!o.parent || !o.parent.isBone)) rootNames.add(o.name);
    });
    if (scene.name) rootNames.add(scene.name);

    animations.forEach((clip: any) => {
      clip.tracks.forEach((t: any) => {
        const [node, prop] = t.name.split('.');
        if (prop !== 'position' || !rootNames.has(node)) return;
        const v = t.values; // flat [x,y,z, x,y,z, ...]
        const x0 = v[0], z0 = v[2];
        for (let i = 0; i < v.length; i += 3) {
          v[i] = x0;      // pin X → no sideways drift
          v[i + 2] = z0;  // pin Z → no forward drift; Y (v[i+1]) kept for bob
        }
      });
    });
  }, [animations, scene]);

  // Play the embedded walk clip and keep the mixer running across all phases
  useEffect(() => {
    const first = animations[0]?.name;
    if (first && actions[first]) {
      actions[first].reset().fadeIn(0.3).play();
    }
    return () => {
      const a = first && actions[first];
      if (a) a.fadeOut(0.2);
    };
  }, [actions, animations]);

  // On load: disable frustum culling + clone each region's material so we can
  // recolor it live without mutating the shared GLTF cache.
  useEffect(() => {
    if (!scene) return;
    const map = { hoodie: [], trouser: [], body: [] };
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.frustumCulled = false;
      const region = regionOf(child.name, child.material?.name);
      if (region) {
        child.material = child.material.clone();
        map[region].push(child.material);
      }
    });
    regionMats.current = map;
  }, [scene]);

  // Recolor regions when the store colours change (null = leave original)
  useEffect(() => {
    const m = regionMats.current;
    if (hoodieColor)  m.hoodie.forEach((mat)  => mat.color.set(hoodieColor));
    if (trouserColor) m.trouser.forEach((mat) => mat.color.set(trouserColor));
    if (bodyColor)    m.body.forEach((mat)    => mat.color.set(bodyColor));
  }, [scene, hoodieColor, trouserColor, bodyColor]);

  // Scale + Mirror (mirror disabled in side-view phases so rotation is clean)
  useEffect(() => {
    if (!groupRef.current) return;
    const inSideView = phase === '2a' || phase === '2b';
    const sx = inSideView ? scale : (mirror ? -scale : scale);
    groupRef.current.scale.set(sx, scale, scale);
  }, [mirror, scale, phase]);

  // Vertical position (live slider feedback in phases 1 and 2a)
  useEffect(() => {
    if (!groupRef.current) return;
    if (phase === 1 || phase === '2a') groupRef.current.position.y = posY;
  }, [posY, phase]);

  // Phase transitions + idle sway — single owner of rotation/position tweens
  useEffect(() => {
    if (!groupRef.current) return;
    const g = groupRef.current;

    exitTimeline.current?.kill();
    idleTimeline.current?.kill();
    gsap.killTweensOf(g.position);
    gsap.killTweensOf(g.rotation);

    if (phase === 1 || phase === '2a') {
      gsap.to(g.position, { x: 0, y: posY, z: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(g.rotation, {
        y: 0, z: 0, duration: 0.8, ease: 'power2.inOut',
        onComplete: () => {
          // Subtle idle sway once transition settles
          idleTimeline.current = gsap.timeline({ repeat: -1 });
          idleTimeline.current
            .to(g.rotation, { z:  0.018, duration: 1.8, ease: 'sine.inOut' })
            .to(g.rotation, { z: -0.012, duration: 1.4, ease: 'sine.inOut' })
            .to(g.rotation, { z:  0,     duration: 1.2, ease: 'sine.inOut' });
        },
      });
      return;
    }

    if (phase === '2b') {
      // Release the treadmill feel: translate the group so the (still-striding)
      // mannequin walks forward (+Z = screen-left) out of frame, then → welcome.
      gsap.to(g.rotation, { z: 0, duration: 0.3, ease: 'power2.out' }); // straighten posture
      exitTimeline.current = gsap.timeline({ onComplete: () => setPhase(3) });
      exitTimeline.current.to(g.position, { z: 8, duration: 1.9, ease: 'none' });
      return;
    }

    return () => {
      exitTimeline.current?.kill();
      idleTimeline.current?.kill();
    };
  }, [phase, setPhase, posY]);

  useFrame(() => {});

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// Reused scratch objects so per-frame centering doesn't allocate
const _box = new THREE.Box3();
const _ctr = new THREE.Vector3();
const _hip = new THREE.Vector3();

function CameraRig({ camRef, groupRef, sideView = 0 }) {
  const phase = useStore((s) => s.phase);
  const sideZoom = useStore((s) => s.sideZoom);
  const sideViewRef = useRef(0);
  sideViewRef.current = sideView;
  const sideZoomRef = useRef(4);
  sideZoomRef.current = sideZoom;
  const hipRef = useRef(null);

  // Orbit around the mannequin's HIP (treadmill-pinned = rock-stable centre) for X/Z,
  // and its bounding-box centre for the vertical look — so it stays centred from any
  // angle and never drifts as the legs/arms swing while walking.
  useFrame(() => {
    const cam = camRef.current;
    if (!cam) return;
    // During walk-off ('2b') and welcome (3) the camera holds its last pose so the
    // mannequin can stride out of a fixed frame instead of the camera following it.
    if (phase === '2b' || phase === 3) return;
    const g = groupRef?.current;

    // Cache the root/hip bone once (mixamo: no bone parent = hips)
    if (g && !hipRef.current) {
      g.traverse((o) => {
        if (!hipRef.current && o.isBone && (!o.parent || !o.parent.isBone)) hipRef.current = o;
      });
    }

    const t = Math.max(sideViewRef.current, phase === '2a' || phase === '2b' ? 1 : 0);
    const angle = t * (Math.PI / 2);   // 0 = front (+Z), 90° = left side (−X)
    const R = 4 + (sideZoomRef.current - 4) * t;

    // Horizontal centre from the stable hip; vertical centre from the bbox mid.
    let cx = 0, cz = 0, cy = 1;
    if (g) {
      _box.setFromObject(g);
      if (isFinite(_box.min.x)) cy = _box.getCenter(_ctr).y;
      if (hipRef.current) {
        hipRef.current.getWorldPosition(_hip);
        cx = _hip.x;
        cz = _hip.z;
      } else if (isFinite(_box.min.x)) {
        cx = _ctr.x; cz = _ctr.z;
      }
    }

    // Front keeps look height 1; side view eases to the true vertical centre.
    const lookY = 1 + (cy - 1) * t;
    const camY  = lookY + 0.5 * (1 - t) + 0.15 * t;
    cam.position.set(cx - R * Math.sin(angle), camY, cz + R * Math.cos(angle));
    cam.lookAt(cx, lookY, cz);
  });

  return (
    <PerspectiveCamera ref={camRef} makeDefault fov={45} position={[0, 1.5, 4]} />
  );
}

export default function MannequinScene({ sideView = 0 }) {
  const groupRef = useRef();
  const camRef = useRef();
  const phase = useStore((s) => s.phase);
  const [canvasOpacity, setCanvasOpacity] = useState(1);

  useEffect(() => {
    if (phase === 3) {
      const o = { v: 1 };
      gsap.to(o, {
        v: 0,
        duration: 0.9,
        ease: 'power2.inOut',
        onUpdate: () => setCanvasOpacity(o.v),
      });
    } else {
      setCanvasOpacity(1);
    }
  }, [phase]);

  return (
    <div style={{ position: 'fixed', inset: 0, opacity: canvasOpacity, transition: 'opacity 0.1s', zIndex: 10, pointerEvents: 'none' }}>
      <Canvas gl={{ alpha: true, powerPreference: 'high-performance' }} style={{ background: 'transparent' }}>
        <CameraRig camRef={camRef} groupRef={groupRef} sideView={sideView} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <pointLight position={[-3, 2, 0]} intensity={2} />
        <Suspense fallback={null}>
          <Mannequin groupRef={groupRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

try {
  useGLTF.preload('/mannequin.glb');
} catch (e) {}
