// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import MannequinScene from '@/components/MannequinScene';
import WelcomeScreen from '@/components/WelcomeScreen';
import CustomizePage from '@/components/CustomizePage';
import Loader from '@/components/Loader';
import { useStore } from '@/store/useStore';

const OUTER   = '#C0B5C4';   // outer dark frame colour
const INNER   = '#DFD5E7';   // inner card colour — slightly deeper lavender
const FRAME_V = 78;          // px — top/bottom frame at rest (progress 0)
const FRAME_H = 140;         // px — left/right frame at rest (progress 0)
const C       = '#1A1A2E';   // text colour
const MONO    = '"Courier New", "Lucida Console", monospace';
const SANS    = '"Plus Jakarta Sans", sans-serif';

// Scroll-progress easing helpers
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth  = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const range   = (x: number, a: number, b: number) => smooth((x - a) / (b - a));

const NAV_ITEMS: [string, boolean][] = [
  ['PLATFORM',    false],
  ['CHARACTER',   true],
  ['ONLINE SHOP', false],
  ['AWARDS',      false],
  ['MEMBERS',     false],
  ['ROAD MAP',    false],
];

export default function SceneLayout() {
  const phase    = useStore((s) => s.phase);
  const setPhase = useStore((s) => s.setPhase);

  // Block scrolling until the GLB has finished loading (loader is still up).
  const { active: loadActive, progress: loadPct } = useProgress();
  const readyRef = useRef(false);
  readyRef.current = loadPct >= 100 && !loadActive;

  // ── Scroll-driven flow. progress: 0=hero → 1=page-2 → 2=side-view/confirm ──
  const MAX = 2;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!readyRef.current) return;
      setProgress((p) => Math.max(0, Math.min(MAX, p + e.deltaY * 0.0011)));
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  // Segment 1 (0→1): inner card expands to full screen
  const ease = smooth(clamp01(progress));
  const fv   = FRAME_V * (1 - ease);
  const fh   = FRAME_H * (1 - ease);

  // Page-1 hero rises up and out
  const heroOp    = 1 - range(progress, 0.0, 0.42);
  const heroShift = -range(progress, 0.0, 0.42) * 80;
  const labelOp   = 1 - range(progress, 0.0, 0.32);
  // Page-2 rises in over 0.5→1, then fades out as the side-view begins (1.05→1.5)
  const pageOp    = range(progress, 0.5, 1.0) * (1 - range(progress, 1.05, 1.5));
  const pageShift = (1 - range(progress, 0.5, 1.0)) * 80;
  // Segment 2 (1→2): mannequin turns to a side profile; Back/Complete fade in
  const sideView  = range(progress, 1.05, 2.0);
  const actionsOp = range(progress, 1.4, 1.95);

  return (
    <>
      {/* ── Loading screen (blocks interaction until the GLB is ready) ── */}
      <Loader />

      {/* ── 3D mannequin layer ── */}
      <MannequinScene sideView={sideView} />

      {/* ── Welcome screen follows mannequin ── */}
      <WelcomeScreen onRestart={() => { setProgress(0); setPhase(1); }} />

      {/* ── Inner card lighter background — grows to full screen ── */}
      <div
        style={{
          position: 'fixed',
          top: fv, left: fh, right: fh, bottom: fv,
          backgroundColor: INNER,
          zIndex: 1,
        }}
      />

      {/* ══ OUTER DARK FRAME BARS (z-2) — thin to nothing as card expands ══ */}
      <div style={{ position:'fixed', inset:0, bottom:'auto', height:fv, backgroundColor:OUTER, zIndex:2 }} />
      <div style={{ position:'fixed', inset:0, top:'auto',   height:fv, backgroundColor:OUTER, zIndex:2 }} />
      <div style={{ position:'fixed', top:fv, left:0,  bottom:fv, width:fh, backgroundColor:OUTER, zIndex:2 }} />
      <div style={{ position:'fixed', top:fv, right:0, bottom:fv, width:fh, backgroundColor:OUTER, zIndex:2 }} />

      {/* ══ OUTER FRAME LABELS — z-12 (fade out as frame collapses) ══ */}
      {labelOp > 0.01 && (
        <>
          {/* TOP-LEFT: CHANGE SETTINGS + /// */}
          <div style={{ position:'fixed', top:18, left:26, zIndex:12, pointerEvents:'none', color:C, opacity:0.38*labelOp, fontFamily:MONO, userSelect:'none' }}>
            <div style={{ fontSize:11, letterSpacing:'0.18em', fontWeight:300 }}>CHANGE SETTINGS</div>
            <div style={{ fontSize:13, marginTop:4, letterSpacing:'0.06em' }}>///</div>
          </div>

          {/* TOP-RIGHT: PUBLIC AVATAR + icon */}
          <div style={{ position:'fixed', top:18, right:26, zIndex:12, pointerEvents:'none', color:C, opacity:0.38*labelOp, fontFamily:MONO, textAlign:'right', userSelect:'none' }}>
            <div style={{ fontSize:11, letterSpacing:'0.18em', fontWeight:300 }}>PUBLIC AVATAR</div>
            <div style={{ fontSize:14, marginTop:4 }}>⌐□</div>
          </div>

          {/* BOTTOM-LEFT: STYLE / NEON RADIANCE */}
          <div style={{ position:'fixed', bottom:16, left:26, zIndex:12, pointerEvents:'none', color:C, opacity:0.35*labelOp, fontFamily:MONO, userSelect:'none' }}>
            <div style={{ fontSize:9,  letterSpacing:'0.22em' }}>STYLE</div>
            <div style={{ fontSize:11, letterSpacing:'0.14em', marginTop:2 }}>NEON RADIANCE</div>
          </div>

          {/* BOTTOM-RIGHT: TECHNOLOGY / WEB 3.0 */}
          <div style={{ position:'fixed', bottom:16, right:26, zIndex:12, pointerEvents:'none', color:C, opacity:0.35*labelOp, fontFamily:MONO, textAlign:'right', userSelect:'none' }}>
            <div style={{ fontSize:9,  letterSpacing:'0.22em' }}>TECHNOLOGY</div>
            <div style={{ fontSize:11, letterSpacing:'0.14em', marginTop:2 }}>WEB 3.0</div>
          </div>
        </>
      )}

      {/* ══ INNER EDITORIAL OVERLAY — z-9, under mannequin (z-10). Insets track the frame ══ */}
      <div
          style={{
            position: 'fixed',
            top: fv, left: fh, right: fh, bottom: fv,
            zIndex: 9,
            pointerEvents: 'none',
            fontFamily: MONO,
            userSelect: 'none',
          }}
        >
          {/* NAV BAR — shared across both pages */}
          <div style={{ position:'absolute', top:20, left:28, right:28 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'11px 0' }}>

              {/* Left: brand marks */}
              <div style={{ display:'flex', alignItems:'center', gap:14, color:C, opacity:0.48 }}>
                <span style={{ fontSize:11, letterSpacing:'0.22em' }}>NEUROMORPHO</span>
                <span style={{ fontSize:11, opacity:0.4 }}>|</span>
                <span style={{ fontSize:11, letterSpacing:'0.12em' }}>2017 — 2024</span>
                <span style={{ fontSize:11, opacity:0.4 }}>|</span>
                <span style={{ fontSize:11, letterSpacing:'0.16em' }}>BETA 2.1 PLATFORM</span>
              </div>

              {/* Centre: ETH */}
              <div style={{ color:C, opacity:0.48 }}>
                <span style={{ fontSize:11, letterSpacing:'0.18em' }}>ETH BALANCE</span>
                <span style={{ fontSize:11, letterSpacing:'0.1em', marginLeft:10 }}>73.5789</span>
              </div>

              {/* Right: stacked nav */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, color:C }}>
                {NAV_ITEMS.map(([label, active]) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:5, opacity: active ? 0.75 : 0.32 }}>
                    {active && <span style={{ fontSize:9 }}>•</span>}
                    <span style={{ fontSize:11, letterSpacing:'0.18em' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PAGE-1 HERO (rises upward + fades out on scroll) ── */}
          <div style={{ position:'absolute', inset:0, opacity:heroOp, transform:`translateY(${heroShift}px)`, pointerEvents:'none' }}>
            {/* HEADLINE */}
            <div style={{ position:'absolute', top:'52%', left:28, transform:'translateY(-50%)', color:C, fontFamily:SANS, lineHeight:1 }}>
              <div style={{ fontSize:54, fontWeight:900, letterSpacing:'-0.01em' }}>CREATING YOUR</div>
              <div style={{ fontSize:54, fontWeight:900, letterSpacing:'-0.01em', display:'flex', alignItems:'center', gap:14, marginTop:6 }}>
                <span style={{
                  display:'inline-flex', width:48, height:48, borderRadius:'50%',
                  border:`2.5px solid ${C}`, alignItems:'center', justifyContent:'center',
                  fontSize:24, flexShrink:0, opacity:0.8,
                }}>☺</span>
                <span>OWN CHARACTER</span>
              </div>
              <div style={{ marginTop:18, fontSize:11, letterSpacing:'0.24em', color:C, opacity:0.38, fontFamily:MONO }}>
                01 + LARGE SELECTION OF CUSTOMIZATION
              </div>
            </div>

            {/* RIGHT TEXT BLOCK */}
            <div style={{ position:'absolute', top:'52%', right:80, transform:'translateY(-50%)', maxWidth:200, color:C }}>
              <div style={{ fontSize:13, letterSpacing:'0.1em', opacity:0.3, marginBottom:12, fontFamily:MONO }}>+++</div>
              <div style={{ fontSize:17, fontWeight:300, lineHeight:1.6, opacity:0.65, fontFamily:SANS }}>
                Our platform allows you to stand out from the crowd
              </div>
              <div style={{ marginTop:16, fontSize:11, letterSpacing:'0.22em', opacity:0.38, fontFamily:MONO }}>
                YOUR UNIQUENESS IS OUR MAIN GOAL
              </div>
            </div>

          </div>

          {/* ── RIGHT-SIDE SCROLL INDICATOR — persists across pages; handle tracks scroll ── */}
          <div style={{ position:'absolute', top:'37%', bottom:'37%', right:26, width:4 }}>
            {/* faint full track */}
            <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:4, transform:'translateX(-50%)', backgroundColor:C, opacity:0.18, borderRadius:2 }} />
            {/* handle slides top → bottom across the whole scroll (0 → MAX) */}
            <div style={{ position:'absolute', left:'50%', top:`calc(${progress / MAX} * (100% - 52px))`, width:4, height:52, transform:'translateX(-50%)', backgroundColor:C, opacity:0.42, borderRadius:2 }} />
          </div>

          {/* PAGE-2 CONTENT is rendered on its own layer above the canvas (see below) */}

          {/* BOTTOM ROW — shared across both pages */}
          <div style={{
            position:'absolute', bottom:44, left:28, right:28,
            display:'flex', alignItems:'center', justifyContent:'space-between', color:C,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, opacity:0.45 }}>
              <span style={{ fontSize:20 }}>↗</span>
              <span style={{ fontSize:12, letterSpacing:'0.16em' }}>MEMBERS 971,258</span>
            </div>
            <div style={{ opacity:0.3, fontSize:15, letterSpacing:'0.1em' }}>//</div>
            <div style={{ opacity:0.45, fontSize:13, letterSpacing:'0.1em' }}>●●●○○</div>
          </div>
        </div>

      {/* ══ PAGE-2 CONTENT — own layer ABOVE the canvas (z-11) so its tabs/swatches
             are clickable regardless of the 3D canvas. Insets track the frame. ══ */}
      {pageOp > 0.01 && (
        <div style={{ position:'fixed', top:fv, left:fh, right:fh, bottom:fv, zIndex:11, pointerEvents:'none' }}>
          <CustomizePage opacity={pageOp} shift={pageShift} />
        </div>
      )}

      {/* ══ SEGMENT-2 CONFIRM — Back / Complete circular buttons (z-11) ══ */}
      {actionsOp > 0.01 && phase === 1 && (
        <div style={{ position:'fixed', inset:0, zIndex:11, opacity:actionsOp, pointerEvents: actionsOp > 0.5 ? 'auto' : 'none' }}>
          <CircleButton label="Back" side="left" filled={false} onClick={() => setProgress(1)} />
          <CircleButton label="Complete" side="right" filled onClick={() => setPhase('2b')} />
        </div>
      )}

    </>
  );
}

// Large outlined circular action button (Back / Complete)
function CircleButton({ label, side, filled, onClick }: { label: string; side: 'left' | 'right'; filled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = filled ? 'rgba(26,26,46,0.10)' : 'rgba(26,26,46,0.04)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = filled ? 'rgba(26,26,46,0.05)' : 'transparent')}
      style={{
        position: 'absolute',
        top: '50%',
        [side]: '24%',
        transform: 'translateY(-50%)',
        width: 150, height: 150, borderRadius: '50%',
        border: '1px solid rgba(26,26,46,0.22)',
        backgroundColor: filled ? 'rgba(26,26,46,0.05)' : 'transparent',
        color: C, fontFamily: SANS, fontSize: 18, fontWeight: 400, letterSpacing: '0.02em',
        cursor: 'pointer', pointerEvents: 'auto',
        transition: 'background-color 0.25s',
      }}
    >
      {label}
    </button>
  );
}
