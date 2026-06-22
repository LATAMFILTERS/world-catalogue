'use client';
import { FC, useState } from 'react';
import Link from 'next/link';

export interface iCardItem {
  title: string;
  subtitle: string;
  description: string;
  system: string;
  src: string;
  href: string;
}

interface iCardProps extends iCardItem {
  i: number;
  total: number;
}

const Card: FC<iCardProps> = ({ title, description, system, src, href, i, total }) => {
  const top = 64 + i * 8;
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      position: 'sticky',
      top: `${top}px`,
      zIndex: i + 1,
      padding: '0 clamp(0.75rem, 3vw, 2rem)',
      paddingBottom: '0.75rem',
    }}>
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'clamp(140px, 35%, 420px) 1fr',
            minHeight: 'clamp(120px, 22vh, 200px)',
            background: hovered ? '#111' : '#0a0a0a',
            border: `1px solid ${hovered ? 'rgba(255,241,45,0.3)' : 'rgba(255,255,255,0.07)'}`,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          {/* Left: logo image */}
          <div style={{
            position: 'relative',
            backgroundColor: '#070707',
            overflow: 'hidden',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: '75%',
              backgroundPosition: 'center 30%',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>

          {/* Right: info */}
          <div style={{
            padding: 'clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}>
            {/* Top: system tag + counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 'clamp(0.55rem, 1vw, 0.65rem)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#FFF12D',
                padding: '0.2rem 0.55rem',
                border: '1px solid rgba(255,241,45,0.25)',
                whiteSpace: 'nowrap',
              }}>
                {system.toUpperCase()}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 'clamp(0.5rem, 0.9vw, 0.58rem)',
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: '0.12em',
                whiteSpace: 'nowrap',
              }}>
                {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(1.1rem, 2.8vw, 2rem)',
              letterSpacing: '-0.02em',
              color: '#fff',
              lineHeight: 1.05,
              margin: 0,
            }}>
              {title}
            </h2>

            {/* Description */}
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.65,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as React.CSSProperties}>
              {description}
            </p>

            {/* Arrow */}
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(0.55rem, 0.9vw, 0.65rem)',
              letterSpacing: '0.2em',
              color: hovered ? '#FFF12D' : 'rgba(255,241,45,0.5)',
              fontWeight: 700,
              transition: 'color 0.2s',
            }}>
              EXPLORE →
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

interface iScrollCardsProps {
  items: iCardItem[];
}

const ScrollCards: FC<iScrollCardsProps> = ({ items }) => {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      {items.map((item, i) => (
        <Card key={item.title} {...item} i={i} total={items.length} />
      ))}
    </div>
  );
};

export { ScrollCards };
