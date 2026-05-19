'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

function IndustryCard({
  industry,
  index,
}: {
  industry: (typeof catalogue.industries)[number];
  index: number;
}) {
  const slug = getSlug(industry.name);
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, opacity: 1 });
  };

  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/industries/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setSpot(s => ({ ...s, opacity: 0 })); setHovered(false); }}
          style={{
            position: 'relative',
            background: '#050505',
            border: `1px solid ${hovered ? 'rgba(255,241,45,0.35)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '2px',
            padding: '2.25rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'border-color 0.3s ease',
          }}
        >
          {/* Spotlight glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, rgba(255,241,45,0.06), transparent 70%)`,
              opacity: spot.opacity,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
            }}
          />

          {/* Animated yellow top bar */}
          <motion.div
            animate={{ scaleX: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: '#FFF12D',
              transformOrigin: 'left',
            }}
          />

          {/* Index */}
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: hovered ? 'rgba(255,241,45,0.5)' : 'rgba(255,255,255,0.15)',
              letterSpacing: '0.1em',
              marginBottom: '1.75rem',
              transition: 'color 0.3s ease',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Subtitle tag */}
          {industry.subtitle && (
            <p
              style={{
                fontSize: '0.65rem',
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: '0 0 0.6rem',
              }}
            >
              {industry.subtitle}
            </p>
          )}

          {/* Industry name */}
          <h3
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
              margin: '0 0 1.25rem',
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              transition: 'color 0.3s ease',
            }}
          >
            {industry.name}
          </h3>

          {/* Description excerpt */}
          <p
            style={{
              fontSize: '0.82rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Outfit, sans-serif',
              margin: 0,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {industry.description}
          </p>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <motion.span
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.12em',
                color: '#FFF12D',
                textTransform: 'uppercase',
              }}
            >
              LEARN MORE →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function IndustriesPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>


      <section style={{ paddingTop: '4rem', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem 1rem' }}>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            // INDUSTRIES
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              lineHeight: 1.1,
              marginBottom: '3rem',
            }}
          >
            12 CRITICAL INDUSTRIES
          </motion.h1>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 5rem' }}>
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {catalogue.industries.map((industry, i) => (
              <IndustryCard key={industry.name} industry={industry} index={i} />
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
