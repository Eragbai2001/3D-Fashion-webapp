// @ts-nocheck
import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';

function Mannequin({ groupRef, materialRef }) {
  const {
    phase, setPhase,
    overdrive, armSpace, mirror, inPlace, scale, posY,
  } = useStore();
  const exitTimeline = useRef();
  const currentActionRef = useRef();
  const originalRootTracksRef = useRef([]);
  const rootNamesRef = useRef(new Set());

  const gltf = useGLTF('/mannequin.glb') as any;
  const scene = gltf.scene;
  const animations = gltf.animations ?? [];
  const { actions } = useAnimations(animations, scene);

  // Detect root bone names + cache original position tracks
  useEffect(() => {
    if (!animations.length || !scene) return;
    const rootNames = new Set<string>();
    scene.traverse((o: any) => {
      if (o.isBone && (!o.parent || !o.parent.isBone)) rootNames.add(o.name);
    });
    rootNames.add(scene.name);
    rootNamesRef.current = rootNames;
    originalRootTracksRef.current = [];
    animations.forEach((clip: any) => {
      clip.tracks.forEach((t: any) => {
        const [node, prop] = t.name.split('.');
        if (prop === 'position' && rootNames.has(node)) {
          originalRootTracksRef.current.push({ clip, track: t });
        }
      });
    });
  }, [animations, scene]);

  // Apply In Place toggle
  useEffect(() => {
    if (!animations.length) return;
    animations.forEach((clip: any) => {
      if (inPlace) {
        clip.tracks = clip.tracks.filter((t: any) => {
          const [node, prop] = t.name.split('.');
          return !(prop === 'position' && rootNamesRef.current.has(node));
        });
      } else {
        const owned = originalRootTracksRef.current
          .filter((e) => e.clip === clip)
          .map((e) => e.track);
        owned.forEach((t) => {
          if (!clip.tracks.includes(t)) clip.tracks.push(t);
        });
      }
    });
    const first = animations[0]?.name;
    if (first && actions[first]) {
      actions[first].reset().play();
    }
  }, [inPlace, animations, actions]);

  useEffect(() => {
    if (!scene) return;
    console.log('Animations:', animations.map((a) => a.name));
    materialRef.current = null;
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.material) child.material.needsUpdate = true;
        child.frustumCulled = false;
      }
    });
  }, [scene]);

  // Play first animation on mount — keep mixer running across all phases
  useEffect(() => {
    const first = animations[0]?.name;
    if (first && actions[first]) {
      const a = actions[first].reset().play();
      currentActionRef.current = a;
    }
  }, [actions]);

  useEffect(() => {
    const a = currentActionRef.current;
    if (a) a.timeScale = overdrive / 50;
  }, [overdrive]);

  // Scale + Mirror. In phase 2/2b mannequin faces RIGHT (rotation handles direction)
  useEffect(() => {
    if (!groupRef.current) return;
    const inSideView = phase === '2a' || phase === '2b';
    // During side view we want true uniform scale (no X-mirror) so rotation cleanly faces right
    const sx = inSideView ? scale : (mirror ? -scale : scale);
    groupRef.current.scale.set(sx, scale, scale);
  }, [mirror, scale, phase]);

  // Vertical position (active in phase 1 and 2a; phase 2b GSAP drives X but Y stays)
  useEffect(() => {
    if (!groupRef.current) return;
    if (phase === 1 || phase === '2a') {
      groupRef.current.position.y = posY;
    }
  }, [posY, phase]);

  useEffect(() => {
    if (!scene) return;
    const factor = 0.6 + (armSpace / 100) * 0.8;
    scene.traverse((o) => {
      if (!o.isBone) return;
      const n = (o.name || '').toLowerCase();
      if (n.includes('arm') || n.includes('shoulder') || n.includes('clavicle')) {
        o.scale.setScalar(factor);
      }
    });
  }, [armSpace, scene]);

  // Phase transitions — never remount, just tween transform
  useEffect(() => {
    if (!groupRef.current) return;
    const g = groupRef.current;

    exitTimeline.current?.kill();
    gsap.killTweensOf(g.position);
    gsap.killTweensOf(g.rotation);

    if (phase === 1) {
      // Front view, centered
      gsap.to(g.rotation, { y: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(g.position, { x: 0, y: posY, z: 0, duration: 0.8, ease: 'power2.inOut' });
      return;
    }

    if (phase === '2a') {
      // Side view via camera move; mannequin keeps front-facing rotation (y=0)
      gsap.to(g.rotation, { y: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(g.position, { x: 0, y: posY, z: 0, duration: 0.8, ease: 'power2.inOut' });
      return;
    }

    if (phase === '2b') {
      // Walk off screen-right. Camera forward ≈ +X, so camera right ≈ +Z.
      // Moving in +Z slides the mannequin laterally off the right edge at roughly
      // constant apparent size, rather than shrinking into the depth of the scene.
      exitTimeline.current = gsap.timeline({
        onComplete: () => setPhase(3),
      });
      exitTimeline.current.to(g.position, {
        z: 10,
        duration: 2.6,
        ease: 'none',
      });
      return;
    }

    return () => exitTimeline.current?.kill();
  }, [phase, setPhase, posY]);

  useFrame(() => {});

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function CameraRig({ camRef }) {
  const phase = useStore((s) => s.phase);
  const sideViewDist = useStore((s) => s.sideViewDist);

  useEffect(() => {
    if (!camRef.current) return;
    const target = (phase === '2a' || phase === '2b')
      ? { x: -sideViewDist, y: 1.4, z: 0 }
      : { x: 0, y: 1.5, z: 4 };
    gsap.to(camRef.current.position, { ...target, duration: 0.9, ease: 'power2.inOut' });
  }, [phase, sideViewDist]);

  useFrame(() => {
    if (camRef.current) camRef.current.lookAt(0, 1, 0);
  });

  return (
    <PerspectiveCamera ref={camRef} makeDefault fov={45} position={[0, 1.5, 4]} />
  );
}

export default function MannequinScene() {
  const groupRef = useRef();
  const materialRef = useRef();
  const camRef = useRef();
  const phase = useStore((s) => s.phase);
  const [canvasOpacity, setCanvasOpacity] = useState(1);

  // Fade canvas out when entering phase 3 (welcome)
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
    <div style={{ position: 'fixed', inset: 0, opacity: canvasOpacity, transition: 'opacity 0.1s', zIndex: 10 }}>
      <Canvas gl={{ alpha: true }} style={{ background: 'transparent' }}>
        <CameraRig camRef={camRef} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <rectAreaLight position={[-3, 2, 0]} intensity={2} width={4} height={4} />
        <Suspense fallback={
          <mesh position={[0, 1, 0]}>
            <capsuleGeometry args={[0.3, 1.2, 4, 16]} />
            <meshStandardMaterial color="#7C3AED" emissive="#9D4EDD" emissiveIntensity={0.4} roughness={0.3} metalness={0.1} />
          </mesh>
        }>
          <Mannequin groupRef={groupRef} materialRef={materialRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

try {
  useGLTF.preload('/mannequin.glb');
} catch (e) {}
