// @ts-nocheck
import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

const C     = '#1A1A2E';
const INNER = '#DFD5E7';
const MONO  = '"Courier New", "Lucida Console", monospace';
const SANS  = '"Plus Jakarta Sans", sans-serif';

// Full-screen loader shown while the GLB loads — blocks interaction until ready,
// then fades out. Replaces the old 3D capsule placeholder.
export default function Loader() {
  const { progress, active } = useProgress();
  const [done, setDone]     = useState(false);
  const [hidden, setHidden] = useState(false);

  const ready = progress >= 100 && !active;

  useEffect(() => {
    if (!ready) return;
    const a = setTimeout(() => setDone(true), 500);   // brief beat at 100%
    const b = setTimeout(() => setHidden(true), 1200); // unmount after fade
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [ready]);

  if (hidden) return null;

  const pct = Math.min(100, Math.round(progress));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: INNER,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: done ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: done ? 'none' : 'auto',
        color: C, userSelect: 'none',
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32em', opacity: 0.5 }}>
        NEUROMORPHO
      </div>

      <div style={{ fontFamily: SANS, fontSize: 64, fontWeight: 300, margin: '18px 0 22px', letterSpacing: '-0.01em' }}>
        {pct}%
      </div>

      {/* progress track */}
      <div style={{ position: 'relative', width: 220, height: 2, backgroundColor: 'rgba(26,26,46,0.16)' }}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct}%`, backgroundColor: C, opacity: 0.7,
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.28em', opacity: 0.4, marginTop: 20 }}>
        LOADING EXPERIENCE
      </div>
    </div>
  );
}
