'use client';
import { FC } from 'react';
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

const Card: FC<iCardProps> = ({ title, subtitle, description, system, src, href, i, total }) => {
  const top = 80 + i * 12;

  return (
    <div style={{
      position: 'sticky',
      top: `${top}px`,
      zIndex: i + 1,
      padding: '0 2rem',
      paddingBottom: '1rem',
    }}>
      <Link href={href} style={{ textDecoration: 'none', display: 'block', maxWidth: '1100px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            height: 'clamp(280px, 38vh, 360px)',
            background: '#0c0c0c',
            border: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,241,45,0.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
          }}
        >
          {/* Left: image */}
          <div style={{ position: 'relative', backgroundColor: '#080808', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: '80%',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }} />
            {/* fade bottom to hide subtitle text baked into image */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              height: '35%',
              background: 'linear-gradient(to top, #0c0c0c 40%, transparent 100%)',
            }} />
          </div>

          {/* Right: info */}
          <div style={{
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Counter + system */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.15em',
              }}>
                {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#FFF12D',
                padding: '0.25rem 0.6rem',
                border: '1px solid rgba(255,241,45,0.3)',
              }}>
                {system.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
              letterSpacing: '-0.02em',
              color: '#fff',
              lineHeight: 1.05,
              marginBottom: '0.4rem',
            }}>
              {title}
            </h2>

            {/* Subtitle */}
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              {subtitle}
            </p>

            {/* Description */}
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.65,
              maxWidth: '400px',
            }}>
              {description}
            </p>

            {/* Arrow */}
            <div style={{
              marginTop: '1.5rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              color: '#FFF12D',
              fontWeight: 700,
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
