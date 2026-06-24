'use client';

import { useEffect, useState } from 'react';

interface Section {
  id: string;
  label: string;
}

export function KSProgressRail({ sections }: { sections: Section[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const headings = sections
      .map(s => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = headings.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Page sections"
      className="ks-progress-rail"
      style={{
        position: 'fixed',
        right: '1.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 100,
      }}
    >
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => {
            const el = document.getElementById(s.id);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          title={s.label}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            border: i === activeIdx
              ? '1px solid #FFF12D'
              : '1px solid rgba(255,255,255,0.12)',
            background: i === activeIdx
              ? 'rgba(255,241,45,0.12)'
              : 'transparent',
            color: i === activeIdx
              ? '#FFF12D'
              : 'rgba(255,255,255,0.3)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          {String(i + 1).padStart(2, '0')}
        </button>
      ))}
    </nav>
  );
}
