// @ts-nocheck
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function WelcomeScreen() {
  const phase = useStore((s) => s.phase);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (phase === 3) {
      requestAnimationFrame(() => setOpacity(1));
    } else {
      setOpacity(0);
    }
  }, [phase]);

  if (phase !== 3) return null;


  return (
    <div
      className="fixed inset-0 z-20 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#EDE6EE',
        opacity,
        transition: 'opacity 0.5s ease',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
    >
      <div className="absolute top-8 left-10 text-2xl font-thin" style={{ color: '#2D1B4E' }}>
        11
      </div>
      <h1 className="text-6xl font-thin tracking-wide" style={{ color: '#2D1B4E' }}>
        Welcome Aboard
      </h1>
      <p className="mt-4 text-sm font-light tracking-widest uppercase" style={{ color: '#2D1B4E', opacity: 0.6 }}>
        Your character has been created
      </p>

    </div>
  );
}
