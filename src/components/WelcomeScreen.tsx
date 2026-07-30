// @ts-nocheck
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

const C     = '#1A1A2E';
const INNER = '#DFD5E7';
const MONO  = '"Courier New", "Lucida Console", monospace';
const SANS  = '"Plus Jakarta Sans", sans-serif';

const NAV_ITEMS: [string, boolean][] = [
  ['PLATFORM',    false],
  ['CHARACTER',   true],
  ['ONLINE SHOP', false],
  ['AWARDS',      false],
  ['MEMBERS',     false],
  ['ROAD MAP',    false],
];

export default function WelcomeScreen({ onRestart }: { onRestart?: () => void }) {
  const phase = useStore((s) => s.phase);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (phase === 3) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
  }, [phase]);

  if (phase !== 3) return null;

  // Staggered rise-in: WELCOME ABOARD leads, the rest follow.
  const rise = (delay: number) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : 'translateY(26px)',
    transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
  });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 20,
        backgroundColor: INNER,
        opacity: shown ? 1 : 0,
        transition: 'opacity 0.6s ease',
        color: C, userSelect: 'none', overflow: 'hidden',
      }}
    >
      {/* NAV BAR (follows after the headline) */}
      <div style={{ position: 'absolute', top: 40, left: 40, right: 40, fontFamily: MONO, ...rise(0.65) }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: 0.48 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.22em' }}>NEUROMORPHO</span>
            <span style={{ fontSize: 11, opacity: 0.4 }}>|</span>
            <span style={{ fontSize: 11, letterSpacing: '0.12em' }}>2017 — 2024</span>
            <span style={{ fontSize: 11, opacity: 0.4 }}>|</span>
            <span style={{ fontSize: 11, letterSpacing: '0.16em' }}>BETA 2.1 PLATFORM</span>
          </div>
          <div style={{ opacity: 0.48 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.18em' }}>ETH BALANCE</span>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', marginLeft: 10 }}>73.5789</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            {NAV_ITEMS.map(([label, active]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: active ? 0.75 : 0.32 }}>
                {active && <span style={{ fontSize: 9 }}>•</span>}
                <span style={{ fontSize: 11, letterSpacing: '0.18em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LEFT: NUMBER IN LINE + 11 */}
      <div style={{ position: 'absolute', top: '40%', left: '6%', fontFamily: MONO, ...rise(0.35) }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.5 }}>NUMBER IN LINE</div>
        <div style={{ fontSize: 60, fontWeight: 300, fontFamily: SANS, marginTop: 8, letterSpacing: '0.02em' }}>11</div>
      </div>

      {/* CENTRE: WELCOME ABOARD (leads the animation) */}
      <div
        style={{
          position: 'absolute', top: '42%', left: '24%',
          fontFamily: SANS, fontWeight: 400, fontSize: 84, lineHeight: 1.02,
          letterSpacing: '-0.01em', ...rise(0),
        }}
      >
        <div>WELCOME</div>
        <div>ABOARD</div>
      </div>

      {/* BACK TO START — restart the whole experience without a reload */}
      <button
        onClick={onRestart}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(26,26,46,0.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        style={{
          position: 'absolute', top: '74%', left: '24%',
          padding: '11px 22px', borderRadius: 40,
          border: '1px solid rgba(26,26,46,0.25)', backgroundColor: 'transparent',
          fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', color: C,
          cursor: 'pointer', transition: 'background-color 0.25s',
          ...rise(0.8),
        }}
      >
        ← BACK TO START
      </button>

      {/* RIGHT: queue notification text */}
      <div
        style={{
          position: 'absolute', top: '43%', right: '6%', width: 260,
          fontFamily: SANS, fontSize: 16, fontWeight: 300, lineHeight: 1.55, opacity: 0.7,
          ...rise(0.5),
        }}
      >
        We have added you to the queue and as soon as it reaches you, we will notify you about open access to the platform.
      </div>

      {/* BOTTOM ROW */}
      <div
        style={{
          position: 'absolute', bottom: 40, left: 40, right: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: MONO, ...rise(0.65),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.45 }}>
          <span style={{ fontSize: 20 }}>↗</span>
          <span style={{ fontSize: 12, letterSpacing: '0.16em' }}>MEMBERS 971,358</span>
        </div>
        <div style={{ opacity: 0.3, fontSize: 15, letterSpacing: '0.1em' }}>//</div>
        <div style={{ opacity: 0.45, fontSize: 13, letterSpacing: '0.1em' }}>●●●○○</div>
      </div>
    </div>
  );
}
