'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { getHomeStats } from '@/lib/home-stats';

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function HomeStatBar() {
  const stats = getHomeStats();

  return (
    <section
      style={{
        background: 'var(--surface-light)',
        padding: 'clamp(2.5rem, 5vw, 3.5rem) clamp(1.25rem, 6vw, 6rem)',
        borderBottom: '1px solid var(--border-on-light)',
      }}
    >
      <div
        className="stats-grid"
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ textAlign: 'center' }}
          >
            <p
              style={{
                fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                color: 'var(--ink)',
                margin: '0 0 0.4rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </p>
            <p
              style={{
                fontFamily: 'Barlow, Arial, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                margin: 0,
              }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
