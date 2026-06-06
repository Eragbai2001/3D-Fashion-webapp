// @ts-nocheck
import { useState } from 'react';
import MannequinScene from '@/components/MannequinScene';
import CustomizationPanel from '@/components/CustomizationPanel';
import WelcomeScreen from '@/components/WelcomeScreen';

const OUTER  = '#C0B5C4';   // outer dark frame colour
const INNER  = '#EDE6EE';   // inner lighter card colour
const FRAME_V = 78;         // px — top/bottom frame (controls height of inner panel)
const FRAME_H = 140;        // px — left/right frame  (controls width  of inner panel)
const C     = '#1A1A2E';   // text colour
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

// ── Reusable small toggle button ──────────────────────────────────────────────
function FrameButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.42')}
      style={{
        padding: '3px 11px',
        fontSize: 9,
        letterSpacing: '0.16em',
        fontFamily: MONO,
        color: C,
        opacity: 0.42,
        backgroundColor: 'transparent',
        border: '1px solid rgba(26,26,46,0.22)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        transition: 'opacity 0.18s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

export default function SceneLayout() {
  const [showMannequin, setShowMannequin] = useState(true);
  const [showControls,  setShowControls]  = useState(true);

  return (
    <>
      {/* ── 3D mannequin layer ── */}
      {showMannequin && <MannequinScene />}

      {/* ── Mannequin controls (CustomizationPanel) — independent toggle ── */}
      {showMannequin && showControls && <CustomizationPanel />}

      {/* ── Welcome screen follows mannequin ── */}
      {showMannequin && <WelcomeScreen />}

      {/* ── Inner card lighter background — always visible ── */}
      <div
        style={{
          position: 'fixed',
          top: FRAME_V, left: FRAME_H, right: FRAME_H, bottom: FRAME_V,
          backgroundColor: INNER,
          zIndex: 1,
        }}
      />

      {/* ══ OUTER DARK FRAME BARS (z-2) ══ */}
      <div style={{ position:'fixed', inset:0, bottom:'auto', height:FRAME_V, backgroundColor:OUTER, zIndex:2 }} />
      <div style={{ position:'fixed', inset:0, top:'auto',   height:FRAME_V, backgroundColor:OUTER, zIndex:2 }} />
      <div style={{ position:'fixed', top:FRAME_V, left:0,  bottom:FRAME_V, width:FRAME_H, backgroundColor:OUTER, zIndex:2 }} />
      <div style={{ position:'fixed', top:FRAME_V, right:0, bottom:FRAME_V, width:FRAME_H, backgroundColor:OUTER, zIndex:2 }} />

      {/* ══ OUTER FRAME LABELS — z-12 (on top of frame bars) ══ */}

      {/* TOP-LEFT: CHANGE SETTINGS + /// */}
      <div
        style={{
          position: 'fixed', top: 18, left: 26,
          zIndex: 12, pointerEvents: 'none',
          color: C, opacity: 0.38, fontFamily: MONO, userSelect: 'none',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.18em', fontWeight: 300 }}>CHANGE SETTINGS</div>
        <div style={{ fontSize: 13, marginTop: 4, letterSpacing: '0.06em' }}>///</div>
      </div>

      {/* TOP-RIGHT: PUBLIC AVATAR + icon */}
      <div
        style={{
          position: 'fixed', top: 18, right: 26,
          zIndex: 12, pointerEvents: 'none',
          color: C, opacity: 0.38, fontFamily: MONO,
          textAlign: 'right', userSelect: 'none',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.18em', fontWeight: 300 }}>PUBLIC AVATAR</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>⌐□</div>
      </div>

      {/* BOTTOM-LEFT: STYLE / NEON RADIANCE */}
      <div
        style={{
          position: 'fixed', bottom: 16, left: 26,
          zIndex: 12, pointerEvents: 'none',
          color: C, opacity: 0.35, fontFamily: MONO, userSelect: 'none',
        }}
      >
        <div style={{ fontSize: 9,  letterSpacing: '0.22em' }}>STYLE</div>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', marginTop: 2 }}>NEON RADIANCE</div>
      </div>

      {/* BOTTOM-RIGHT: TECHNOLOGY / WEB 3.0 */}
      <div
        style={{
          position: 'fixed', bottom: 16, right: 26,
          zIndex: 12, pointerEvents: 'none',
          color: C, opacity: 0.35, fontFamily: MONO,
          textAlign: 'right', userSelect: 'none',
        }}
      >
        <div style={{ fontSize: 9,  letterSpacing: '0.22em' }}>TECHNOLOGY</div>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', marginTop: 2 }}>WEB 3.0</div>
      </div>

      {/* ══ TWO TOGGLE BUTTONS — bottom-centre of outer frame, z-50 ══ */}
      <div
        style={{
          position: 'fixed',
          bottom: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <FrameButton
          label={showControls ? 'HIDE CONTROLS' : 'SHOW CONTROLS'}
          onClick={() => setShowControls((p) => !p)}
        />
        <FrameButton
          label={showMannequin ? 'HIDE MANNEQUIN' : 'SHOW MANNEQUIN'}
          onClick={() => setShowMannequin((p) => !p)}
        />
      </div>

      {/* ══ INNER EDITORIAL OVERLAY — z-9, under mannequin (z-10) so character pops out ══ */}
      <div
          style={{
            position: 'fixed',
            top: FRAME_V, left: FRAME_H, right: FRAME_H, bottom: FRAME_V,
            zIndex: 9,
            pointerEvents: 'none',
            fontFamily: MONO,
            userSelect: 'none',
          }}
        >
          {/* NAV BAR */}
          <div
            style={{
              position: 'absolute',
              top: 20, left: 28, right: 28,
            }}
          >
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

          {/* HEADLINE — positioned at ~55% from top so it's centred but clears mannequin */}
          <div
            style={{
              position: 'absolute',
              top: '52%', left: 28,
              transform: 'translateY(-50%)',
              color: C, fontFamily: SANS, lineHeight: 1,
            }}
          >
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

          {/* RIGHT TEXT BLOCK — aligned with headline vertical centre */}
          <div
            style={{
              position:'absolute', top:'52%', right:80,
              transform:'translateY(-50%)', maxWidth:200, color:C,
            }}
          >
            <div style={{ fontSize:13, letterSpacing:'0.1em', opacity:0.3, marginBottom:12, fontFamily:MONO }}>+++</div>
            <div style={{ fontSize:17, fontWeight:300, lineHeight:1.6, opacity:0.65, fontFamily:SANS }}>
              Our platform allows you to stand out from the crowd
            </div>
            <div style={{ marginTop:16, fontSize:11, letterSpacing:'0.22em', opacity:0.38, fontFamily:MONO }}>
              YOUR UNIQUENESS IS OUR MAIN GOAL
            </div>
          </div>


          {/* BOTTOM ROW */}
          <div style={{
            position:'absolute', bottom:44, left:28, right:28,
            display:'flex', alignItems:'center', justifyContent:'space-between', color:C,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, opacity:0.45 }}>
              <span style={{ fontSize:20 }}>↗</span>
              <span style={{ fontSize:12, letterSpacing:'0.16em' }}>MEMBERS 871,368</span>
            </div>
            <div style={{ opacity:0.3, fontSize:15, letterSpacing:'0.1em' }}>//</div>
            <div style={{ opacity:0.45, fontSize:13, letterSpacing:'0.1em' }}>●●○○</div>
          </div>
        </div>
    </>
  );
}
