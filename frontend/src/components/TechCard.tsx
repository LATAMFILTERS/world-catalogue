'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CatalogueItem, getSlug, getTechLogoFile } from '@/lib/catalogue';

interface TechCardProps {
  item: CatalogueItem;
  index: number;
  visible: boolean;
}

export function TechCard({ item, index, visible }: TechCardProps) {
  const [hovered, setHovered] = useState(false);
  const logoFile = getTechLogoFile(item.name);

  return (
    <Link
      href={`/technologies/${getSlug(item.name)}/`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: hovered ? '#0a0a0a' : '#050505',
        border: hovered ? '1px solid rgba(255,241,45,0.4)' : '1px solid rgba(255,255,255,0.06)',
        padding: '2rem',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? '0 0 32px rgba(255,241,45,0.12), inset 0 0 32px rgba(255,241,45,0.03)' : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${Math.min(index * 60, 400)}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: '1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Image
          src={`/assets/${logoFile}`}
          alt={item.name}
          width={120}
          height={48}
          style={{
            objectFit: 'contain',
            objectPosition: 'left center',
            filter: hovered ? 'brightness(1.2)' : 'brightness(0.8) grayscale(0.3)',
            transition: 'filter 0.3s ease',
            maxHeight: '48px',
          }}
        />
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 900,
          fontSize: '1.1rem',
          color: hovered ? '#FFF12D' : '#fff',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          marginBottom: '0.4rem',
          transition: 'color 0.3s ease',
        }}
      >
        {item.title}
      </h3>

      {item.subtitle && (
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '1rem',
          }}
        >
          {item.subtitle}
        </p>
      )}

      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.6,
          flex: 1,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.description}
      </p>

      {/* Glow indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#FFF12D',
            boxShadow: hovered ? '0 0 8px #FFF12D, 0 0 16px rgba(255,241,45,0.5)' : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        />
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.1em',
            color: hovered ? 'rgba(255,241,45,0.7)' : 'rgba(255,255,255,0.25)',
            transition: 'color 0.3s ease',
          }}
        >
          LEARN MORE
        </span>
      </div>
    </Link>
  );
}

interface TechShowcaseProps {
  technologies: CatalogueItem[];
}

export function TechShowcase({ technologies }: TechShowcaseProps) {
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

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '6rem 0',
        background: '#000',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
      id="technologies"
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '2px', background: '#FFF12D' }} />
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: '#FFF12D',
              }}
            >
              TECHNOLOGIES
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              color: '#fff',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            PROPRIETARY FILTRATION
            <br />
            <span style={{ color: '#FFF12D' }}>TECHNOLOGIES</span>
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.95rem',
              maxWidth: '480px',
              lineHeight: 1.7,
            }}
          >
            12 engineered filtration technologies designed for extreme conditions across every industrial sector.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          {technologies.map((tech, i) => (
            <TechCard key={tech.name} item={tech} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
