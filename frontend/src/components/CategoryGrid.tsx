'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CatalogueItem, getSlug } from '@/lib/catalogue';

interface CategoryGridProps {
  items: CatalogueItem[];
  category: 'industries' | 'products' | 'technologies';
  title?: string;
  description?: string;
}

const CATEGORY_NUMBERS: Record<string, string[]> = {
  Agriculture: ['01', '02', '03', '04'],
  Automotive: ['05', '06', '07', '08'],
  'Bus Coach': ['09', '10', '11', '12'],
  Construction: ['13', '14', '15', '16'],
  Manufacturing: ['17', '18', '19', '20'],
  Marine: ['21', '22', '23', '24'],
  Mining: ['25', '26', '27', '28'],
  'Oil Gas': ['29', '30', '31', '32'],
  'Power Generation': ['33', '34', '35', '36'],
  Railway: ['37', '38', '39', '40'],
  'Trucks Fleets': ['41', '42', '43', '44'],
  'Waste Municipal': ['45', '46', '47', '48'],
};

const CATEGORY_ACCENT: Record<string, string[]> = {
  industries: [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#06B6D4', '#F97316', '#84CC16',
    '#EC4899', '#14B8A6', '#6366F1', '#A855F7'
  ],
  products: [
    '#FFF12D', '#FFF12D', '#FFF12D', '#FFF12D',
    '#FFF12D', '#FFF12D', '#FFF12D', '#FFF12D',
    '#FFF12D', '#FFF12D', '#FFF12D', '#FFF12D'
  ],
  technologies: [
    '#FFF12D', '#FFF12D', '#FFF12D', '#FFF12D',
    '#FFF12D', '#FFF12D', '#FFF12D', '#FFF12D',
    '#FFF12D', '#FFF12D', '#FFF12D', '#FFF12D'
  ],
};

export function CategoryGrid({ items, category, title, description }: CategoryGridProps) {
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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const accents = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.industries;

  return (
    <section ref={sectionRef} style={{ padding: '6rem 0', background: '#000' }} id={category}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Section header */}
        {(title || description) && (
          <div style={{ marginBottom: '3.5rem' }}>
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '2px', background: '#FFF12D' }} />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    textTransform: 'uppercase',
                  }}
                >
                  {category.toUpperCase()}
                </span>
              </div>
            )}
            <h2
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                color: '#fff',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                marginBottom: description ? '1rem' : 0,
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '1rem',
                  maxWidth: '560px',
                  lineHeight: 1.7,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          {items.map((item, i) => (
            <GridCard
              key={item.name}
              item={item}
              category={category}
              index={i}
              visible={visible}
              accent={accents[i % accents.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GridCard({
  item,
  category,
  index,
  visible,
  accent,
}: {
  item: CatalogueItem;
  category: string;
  index: number;
  visible: boolean;
  accent: string;
}) {
  const [hovered, setHovered] = useState(false);
  const href = `/${category}/${getSlug(item.name)}/`;

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        background: hovered ? '#050505' : '#000',
        padding: '2rem',
        textDecoration: 'none',
        border: hovered ? `1px solid ${accent}` : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? `0 0 24px rgba(255,241,45,0.1), inset 0 0 24px rgba(255,241,45,0.02)` : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${Math.min(index * 50, 300)}ms`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent line top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: hovered ? accent : 'transparent',
          transition: 'background 0.3s ease',
        }}
      />

      {/* Index number */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: hovered ? accent : 'rgba(255,255,255,0.2)',
          marginBottom: '1.5rem',
          transition: 'color 0.3s ease',
        }}
      >
        {String(index + 1).padStart(2, '0')} /{' '}
        {category === 'industries' ? 'INDUSTRY' : category === 'products' ? 'PRODUCT' : 'TECHNOLOGY'}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          marginBottom: '0.5rem',
          transition: 'color 0.3s ease',
        }}
      >
        {item.title}
      </h3>

      {item.subtitle && (
        <p
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '0.8rem',
            color: hovered ? accent : 'rgba(255,255,255,0.35)',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
            transition: 'color 0.3s ease',
          }}
        >
          {item.subtitle}
        </p>
      )}

      {/* Description */}
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.description}
      </p>

      {/* Features preview */}
      {item.features.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {item.features.slice(0, 3).map((f) => (
            <span
              key={f}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.05em',
                padding: '0.2rem 0.5rem',
                border: `1px solid ${hovered ? 'rgba(255,241,45,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: hovered ? 'rgba(255,241,45,0.8)' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.3s ease',
              }}
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Arrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: hovered ? accent : 'rgba(255,255,255,0.25)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          transition: 'all 0.3s ease',
        }}
      >
        <span>VIEW</span>
        <span style={{ transform: hovered ? 'translateX(4px)' : 'none', transition: 'transform 0.3s ease' }}>
          →
        </span>
      </div>
    </Link>
  );
}
