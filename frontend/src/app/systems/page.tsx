'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';

const displayNames: Record<string, string> = {
  'Airfilter': 'Air Filter',
  'Aquaguard Series': 'Aquaguard Filter',
  'Cabin': 'Cabin Filter',
  'Coolant': 'Coolant Filter',
  'Dryer': 'Air Dryer',
  'Fuel': 'Fuel Filter',
  'Housing': 'Housing Filter',
  'Hydraulic': 'Hydraulic Filter',
  'Kits': 'Filter Kits',
  'Marine': 'Marine Filter',
  'Oil': 'Oil Filter',
  'Water': 'Fuel Separator',
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

function SystemCard({
  product,
  index,
}: {
  product: (typeof catalogue.products)[number];
  index: number;
}) {
  const slug = getSlug(product.name);
  const name = displayNames[product.name] || product.name;
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
      <Link href={`/products/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
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
            gap: '0',
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
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: '#FFF12D',
              transformOrigin: 'left',
            }}
          />

          {/* Index number */}
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              fontWeight: 500,
              color: hovered ? 'rgba(255,241,45,0.5)' : 'rgba(255,255,255,0.15)',
              letterSpacing: '0.1em',
              marginBottom: '1.75rem',
              transition: 'color 0.3s ease',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Subtitle tag */}
          {product.subtitle && (
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
              {product.subtitle}
            </p>
          )}

          {/* Product name */}
          <h3
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
              margin: '0 0 1.25rem',
              lineHeight: 1.2,
              transition: 'color 0.3s ease',
            }}
          >
            {name}
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
            {product.description}
          </p>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
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

export default function SystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>


      {/* Hero */}
      <section
        style={{
          marginTop: 0,
          paddingTop: '5rem',
          paddingBottom: '5rem',
          backgroundImage: 'url(/images/system-hero.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundAttachment: 'scroll',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 100%)',
            zIndex: 1,
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '1.5rem',
              }}
            >
              // SYSTEMS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            12 ENGINEERED FILTRATION SYSTEMS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Outfit, sans-serif',
              maxWidth: '700px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            Air, Fuel, Hydraulic, Oil, Cabin, Coolant, and more. Each system engineered with
            Asset Protection Technology for maximum performance and reliability.
          </motion.p>
        </div>
      </section>

      {/* Systems Grid */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {catalogue.products.map((product, i) => (
              <SystemCard key={product.name} product={product} index={i} />
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
