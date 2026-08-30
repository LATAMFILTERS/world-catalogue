'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface StatCounterProps {
  stats: Stat[];
  title?: string;
}

function parseValue(val: string): { num: number; prefix: string; suffix: string } {
  const match = val.match(/^([^0-9]*)([0-9.]+)(.*)$/);
  if (!match) return { num: 0, prefix: '', suffix: val };
  return {
    num: parseFloat(match[2]),
    prefix: match[1],
    suffix: match[3],
  };
}

function AnimatedNumber({ value, active }: { value: string; active: boolean }) {
  const { num, prefix, suffix } = parseValue(value);
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const duration = 2000;

  useEffect(() => {
    if (!active) return;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * num);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, num]);

  const display =
    num % 1 !== 0
      ? current.toFixed(1)
      : Math.round(current).toLocaleString();

  return (
    <span>
      {prefix}{display}{suffix}
    </span>
  );
}

export function StatCounter({ stats, title }: StatCounterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '6rem 0',
        background: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {title && (
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '1px', background: 'rgba(255,241,45,0.4)' }} />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(255,241,45,0.6)',
                  textTransform: 'uppercase',
                }}
              >
                PERFORMANCE METRICS
              </span>
              <div style={{ width: '40px', height: '1px', background: 'rgba(255,241,45,0.4)' }} />
            </div>
            <h2
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h2>
          </div>
        )}

        <div
          className="stat-counter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                background: '#050505',
                padding: '3rem 2rem',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Top accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: active ? '60%' : '0%',
                  height: '2px',
                  background: '#FFF12D',
                  transition: 'width 1s ease',
                  transitionDelay: `${i * 150}ms`,
                }}
              />

              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  color: '#FFF12D',
                  lineHeight: 1,
                  marginBottom: '0.75rem',
                  opacity: active ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <AnimatedNumber value={stat.value} active={active} />
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
