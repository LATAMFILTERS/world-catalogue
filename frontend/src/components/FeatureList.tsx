'use client';

import { useEffect, useRef, useState } from 'react';

interface FeatureListProps {
  features: string[];
  title?: string;
  accent?: string;
}

export function FeatureList({ features, title, accent = '#FFF12D' }: FeatureListProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef}>
      {title && (
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}
        >
          {title}
        </h3>
      )}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {features.map((feature, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-16px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `1px solid ${accent}`,
                color: accent,
                fontSize: '0.65rem',
                fontWeight: 700,
                marginTop: '0.1rem',
              }}
            >
              ✓
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.5,
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
