'use client';

import { motion, useScroll, useSpring } from 'motion/react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: '#FFF12D',
        transformOrigin: '0%',
        scaleX,
        zIndex: 99997,
        pointerEvents: 'none',
        boxShadow: '0 0 10px rgba(255,241,45,0.7)',
      }}
    />
  );
}
