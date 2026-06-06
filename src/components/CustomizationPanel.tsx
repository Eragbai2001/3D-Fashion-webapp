// @ts-nocheck
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = ['#7C3AED', '#0AB8BD', '#F97316', '#1A1A2E'];

export default function CustomizationPanel() {
  const {
    phase, hoodieColor, setHoodieColor, setPhase,
    overdrive, setOverdrive,
    armSpace, setArmSpace,
    trimStart, trimEnd, setTrim,
    mirror, setMirror,
    inPlace, setInPlace,
    scale, setScale,
    posY, setPosY,
    sideViewDist, setSideViewDist,
  } = useStore();

  const [showWalkPanel, setShowWalkPanel] = useState(true);

  // Side view controls (Phase 2a / 2b)
  if (phase === '2a' || phase === '2b') {
    return (
      <>
        {/* Back button — left */}
        <button
          onClick={() => setPhase(1)}
          className="fixed left-8 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xl flex items-center justify-center text-2xl font-light hover:bg-white transition-colors"
          style={{ color: '#2D1B4E', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          aria-label="Back"
        >
          ←
        </button>

        {/* Zoom / camera distance slider — bottom center, only in 2a */}
        {phase === '2a' && (
          <div
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl w-64"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold" style={{ color: '#2D1B4E' }}>Camera Distance</span>
              <span className="text-gray-500">{sideViewDist.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={10}
              step={0.1}
              value={sideViewDist}
              onChange={(e) => setSideViewDist(Number(e.target.value))}
              className="w-full accent-gray-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Closer</span>
              <span>Further</span>
            </div>
          </div>
        )}

        {/* Complete button — right, only in 2a, fades in */}
        <button
          onClick={() => setPhase('2b')}
          disabled={phase !== '2a'}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center text-2xl font-light hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: '#2D1B4E',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            opacity: phase === '2a' ? 1 : 0,
            transitionDuration: '600ms',
            pointerEvents: phase === '2a' ? 'auto' : 'none',
          }}
          aria-label="Complete"
        >
          ✓
        </button>
      </>
    );
  }

  if (phase !== 1) return null;

  return (
    <div
      className="fixed right-8 top-1/2 -translate-y-1/2 z-10 w-80 space-y-4"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* Hoodie color */}
      <div className="p-6 rounded-2xl backdrop-blur-md bg-white/40 border border-white/60 shadow-xl">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#2D1B4E' }}>
          Hoodies customization
        </h2>
        <div className="flex gap-3 mb-5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setHoodieColor(c)}
              className="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: hoodieColor === c ? '#2D1B4E' : 'transparent',
              }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <button
          onClick={() => setPhase('2a')}
          className="w-full py-2.5 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#2D1B4E' }}
        >
          Complete
        </button>
      </div>


      {/* Walk controls */}
      {showWalkPanel && (
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: '#1a1a1a' }}>
              Catwalk Walk Forward
            </h3>
            <button
              onClick={() => setShowWalkPanel(false)}
              className="text-gray-400 hover:text-gray-700"
              aria-label="Close walk panel"
            >
              <X size={16} />
            </button>
          </div>

          <SliderRow
            label="Overdrive"
            value={overdrive}
            min={0}
            max={100}
            onChange={setOverdrive}
          />

          <SliderRow
            label="Character Arm-Space"
            value={armSpace}
            min={0}
            max={100}
            onChange={setArmSpace}
          />

          <SliderRow
            label="Scale"
            value={scale}
            min={0.001}
            max={1}
            step={0.001}
            onChange={setScale}
            display={scale.toFixed(3)}
          />

          <SliderRow
            label="Vertical Position"
            value={posY}
            min={-3}
            max={3}
            step={0.01}
            onChange={setPosY}
            display={posY.toFixed(2)}
          />

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-800">
                Trim <span className="font-normal text-gray-500">67 total frames</span>
              </span>
            </div>
            <RangeSlider
              min={-50}
              max={150}
              valueStart={trimStart}
              valueEnd={trimEnd}
              onChange={setTrim}
            />
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>{trimStart}</span>
              <span>{trimEnd}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={mirror}
                onChange={(e) => setMirror(e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-gray-800">Mirror</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={inPlace}
                onChange={(e) => setInPlace(e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-gray-800">In Place</span>
            </label>
          </div>
        </div>
      )}

      {!showWalkPanel && (
        <button
          onClick={() => setShowWalkPanel(true)}
          className="w-full py-2 rounded-lg bg-white border border-gray-200 shadow text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Show walk controls
        </button>
      )}
    </div>
  );
}

function SliderRow({ label, value, min, max, onChange, step = 1, display }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-gray-800">{label}</span>
        <span className="text-gray-600">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gray-500"
      />
    </div>
  );
}

function RangeSlider({ min, max, valueStart, valueEnd, onChange }) {
  return (
    <div className="relative h-5">
      <input
        type="range"
        min={min}
        max={max}
        value={valueStart}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), valueEnd - 1);
          onChange(v, valueEnd);
        }}
        className="absolute inset-0 w-full accent-gray-500"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueEnd}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), valueStart + 1);
          onChange(valueStart, v);
        }}
        className="absolute inset-0 w-full accent-gray-500"
      />
    </div>
  );
}
