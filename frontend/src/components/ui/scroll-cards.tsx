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
  const scale = 1 - (total - 1 - i) * 0.03;

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'sticky',
      top: 0,
    }}>
      <Link href={href} style={{ textDecoration: 'none', width: '100%', maxWidth: '1100px', padding: '0 2rem' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(420px, 65vh, 580px)',
          overflow: 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s linear',
          cursor: 'pointer',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.outline = '1px solid rgba(255,241,45,0.4)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.outline = 'none';
          }}
        >
          {/* Background image */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#080808',
          }} />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(120deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 100%)',
          }} />

          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 'clamp(2rem, 4vw, 3.5rem)',
          }}>
            {/* System tag */}
            <span style={{
              display: 'inline-block',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: '#FFF12D',
              marginBottom: '1rem',
              padding: '0.3rem 0.75rem',
              border: '1px solid rgba(255,241,45,0.35)',
              width: 'fit-content',
            }}>
              {system.toUpperCase()}
            </span>

            {/* Title */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.02em',
              color: '#fff',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}>
              {title}
            </h2>

            {/* Subtitle */}
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.15em',
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
            }}>
              {subtitle}
            </p>

            {/* Description */}
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              maxWidth: '520px',
            }}>
              {description}
            </p>

            {/* Arrow */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: '#FFF12D',
              fontWeight: 700,
            }}>
              EXPLORE TECHNOLOGY →
            </div>
          </div>

          {/* Card number */}
          <div style={{
            position: 'absolute',
            top: 'clamp(1.5rem, 3vw, 2.5rem)',
            right: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.15em',
          }}>
            {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
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
    <div>
      {items.map((item, i) => (
        <Card key={item.title} {...item} i={i} total={items.length} />
      ))}
    </div>
  );
};

export { ScrollCards };
