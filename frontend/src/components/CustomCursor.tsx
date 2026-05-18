'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export function CustomCursor() {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  const dotX = useSpring(mx, { stiffness: 1400, damping: 55, mass: 0.25 });
  const dotY = useSpring(my, { stiffness: 1400, damping: 55, mass: 0.25 });
  const ringX = useSpring(mx, { stiffness: 280, damping: 22, mass: 1 });
  const ringY = useSpring(my, { stiffness: 280, damping: 22, mass: 1 });

  const cx = useTransform(dotX, v => v - 4);
  const cy = useTransform(dotY, v => v - 4);
  const rx = useTransform(ringX, v => v - 20);
  const ry = useTransform(ringY, v => v - 20);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mx, my]);

  return (
    <>
      <style>{`
        @media (pointer: fine) { *, *::before, *::after { cursor: none !important; } }
      `}</style>

      {/* Dot */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0,
          x: cx, y: cy,
          width: 8, height: 8,
          borderRadius: '50%',
          background: '#FFF12D',
          zIndex: 99999,
          pointerEvents: 'none',
          mixBlendMode: 'difference',
        }}
      />

      {/* Ring */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0,
          x: rx, y: ry,
          width: 40, height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(255,241,45,0.5)',
          zIndex: 99998,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
