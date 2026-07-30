// @ts-nocheck
// Page-2 content (revealed as the inner card expands to full screen).
// Rendered as an absolute layer filling the inner overlay's coordinate space,
// so it sits UNDER the mannequin (z-10) and repositions with the frame.
import { useState } from 'react';
import { useStore } from '@/store/useStore';

const C    = '#1A1A2E';
const MONO = '"Courier New", "Lucida Console", monospace';
const SANS = '"Plus Jakarta Sans", sans-serif';

// Which mannequin region each category edits (only these three are wired for now)
const REGION_BY_CAT: Record<string, 'hoodie' | 'trouser' | 'body'> = {
  CHEST: 'hoodie',
  LEGS:  'trouser',
  HEAD:  'body',
  HANDS: 'body',
  SHOES: 'body',
};

// Swatch = display gradient + the solid colour applied to the mannequin
const SWATCHES = [
  { grad: 'radial-gradient(circle at 35% 30%, #B79CE8, #7C3AED)', color: '#7C3AED' },
  { grad: 'radial-gradient(circle at 35% 30%, #8FB4C9, #3E6A86)', color: '#3E6A86' },
  { grad: 'radial-gradient(circle at 35% 30%, #FBD9A8, #F5A03C)', color: '#F5A03C' },
];

// Each category owns the list of options that "feeds up" when it's selected.
const CATEGORIES: { label: string; num: string; items: string[] }[] = [
  { label: 'HEAD',  num: '3',  items: ['CAP', 'MASK', 'GLASSES'] },
  { label: 'CHEST', num: '5',  items: ['T-SHIRT', 'SHORTS', 'HOODIES', 'SWEATERS', 'JACKETS'] },
  { label: 'HANDS', num: '2',  items: ['GLOVES', 'RINGS'] },
  { label: 'LEGS',  num: '7',  items: ['JEANS', 'JOGGERS', 'SHORTS'] },
  { label: 'SHOES', num: '11', items: ['SNEAKERS', 'BOOTS', 'SANDALS'] },
];

const TYPES: [string, boolean][] = [
  ['F14', false],
  ['F15', false],
  ['F16', true],
  ['F17', false],
];

const ROW_H = 45; // px — per big-category row (font 30 + 15 gap); used to offset the sub-list

const titleCase = (s: string) =>
  s.charAt(0) + s.slice(1).toLowerCase();

export default function CustomizePage({ opacity = 1, shift = 0 }: { opacity?: number; shift?: number }) {
  const [activeCat, setActiveCat]   = useState('CHEST');
  const [activeItem, setActiveItem] = useState('HOODIES');

  const activeIndex = CATEGORIES.findIndex((c) => c.label === activeCat);
  const activeItems = CATEGORIES[activeIndex]?.items ?? [];

  // Colour of the region the current category edits
  const { hoodieColor, trouserColor, bodyColor, setHoodieColor, setTrouserColor, setBodyColor } = useStore();
  const region       = REGION_BY_CAT[activeCat] ?? 'body';
  const regionColor  = region === 'hoodie' ? hoodieColor : region === 'trouser' ? trouserColor : bodyColor;
  const setRegionColor = (c: string) =>
    region === 'hoodie' ? setHoodieColor(c) : region === 'trouser' ? setTrouserColor(c) : setBodyColor(c);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        transform: `translateY(${shift}px)`,
        pointerEvents: opacity > 0.5 ? 'auto' : 'none',
        color: C,
        userSelect: 'none',
      }}
    >
      {/* one-time keyframe for the "feed up" reveal */}
      <style>{`@keyframes cpFeed{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── LEFT: section labels ── */}
      <div style={{ position: 'absolute', top: '35%', left: '6%', fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', opacity: 0.55 }}>
        MAIN CHARACTERISTICS
      </div>
      <div style={{ position: 'absolute', top: '44%', left: '6%', fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', opacity: 0.55 }}>
        CUSTOMIZATION OPTIONS
      </div>

      {/* intro blurb — wide enough to stay 3 lines and clear the category list */}
      <div
        style={{
          position: 'absolute', top: '35%', left: '23%', width: 300,
          fontFamily: MONO, fontSize: 11, lineHeight: 1.65, letterSpacing: '0.04em', opacity: 0.5,
        }}
      >
        YOUR CHARACTER EMITS A BRIGHT NEON GLOW, MAKING THEM VISIBLE EVEN IN THE DARKEST CORNERS OF THE METAVERSE
      </div>

      {/* ── CENTRE-LEFT: category list + reveal-on-click sub-items ── */}
      <div
        style={{
          position: 'absolute', top: '46%', left: '23%',
          display: 'flex', alignItems: 'flex-start', gap: 60,
        }}
      >
        {/* big clickable categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, fontFamily: SANS }}>
          {CATEGORIES.map(({ label, num }) => {
            const active = label === activeCat;
            return (
              <div
                key={label}
                onClick={() => {
                  setActiveCat(label);
                  const items = CATEGORIES.find((c) => c.label === label)?.items ?? [];
                  if (items.length) setActiveItem(items[0]);
                }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  opacity: active ? 0.95 : 0.4,
                  cursor: 'pointer', transition: 'opacity 0.2s',
                }}
              >
                <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '0.01em', lineHeight: 1 }}>{label}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, marginTop: 3, opacity: 0.7 }}>{num}</span>
              </div>
            );
          })}
        </div>

        {/* sub-items — feed up from the selected category's row */}
        {activeItems.length > 0 && (
          <div
            key={activeCat}
            style={{
              display: 'flex', flexDirection: 'column', gap: 22, fontFamily: MONO,
              marginTop: activeIndex * ROW_H + 12,
              animation: 'cpFeed 0.4s ease',
            }}
          >
            {activeItems.map((label) => {
              const active = label === activeItem;
              return (
                <span
                  key={label}
                  onClick={() => setActiveItem(label)}
                  style={{
                    fontSize: 11, letterSpacing: '0.16em', lineHeight: 1,
                    opacity: active ? 0.9 : 0.4, fontWeight: active ? 700 : 400,
                    cursor: 'pointer', transition: 'opacity 0.2s',
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── RIGHT: Hoodies customization panel — compact, pulled in toward the mannequin ── */}
      <div style={{ position: 'absolute', top: '50%', right: '20%', width: 285, transform: 'translateY(-50%)' }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', opacity: 0.55 }}>
          COLORS / SIZE / OPTIONS
        </div>

        <div style={{ marginTop: 24, fontFamily: MONO, fontSize: 13, letterSpacing: '0.1em', opacity: 0.3 }}>+++</div>
        <div style={{ marginTop: 6, fontFamily: SANS, fontSize: 26, fontWeight: 400, letterSpacing: '-0.01em' }}>
          {titleCase(activeItem)} customization
        </div>

        {/* select color */}
        <div style={{ marginTop: 20, fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', opacity: 0.5 }}>
          SELECT COLOR
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
          {SWATCHES.map(({ grad, color }) => {
            const selected = regionColor === color;
            return (
              <span
                key={color}
                onClick={() => setRegionColor(color)}
                style={{
                  width: 40, height: 40, borderRadius: '50%', background: grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: selected ? `0 0 0 2px ${C}` : 'none',
                }}
              >
                {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />}
              </span>
            );
          })}
        </div>

        {/* select type */}
        <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', opacity: 0.5 }}>
          SELECT TYPE
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {TYPES.map(([label, active]) => (
            <span
              key={label}
              style={{
                padding: '8px 16px',
                borderRadius: 18,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.08em',
                backgroundColor: active ? '#2D1B4E' : 'rgba(26,26,46,0.06)',
                color: active ? '#fff' : C,
                opacity: active ? 1 : 0.55,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22, fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', opacity: 0.5 }}>
          <span>28 ELEMENTS AVAILABLE</span>
          <span style={{ opacity: 0.7 }}>⌂ 57 LOCKED</span>
        </div>
      </div>
    </div>
  );
}
