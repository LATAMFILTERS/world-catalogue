'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
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

const productImages: Record<string, string> = {
  'Airfilter': '/images/air-filterld.avif',
  'Aquaguard Series': '/images/turbinas-hero.avif',
  'Cabin': '/images/filtro-de-cabina.avif',
  'Coolant': '/images/coolant-hero.avif',
  'Dryer': '/images/airdryer-hero.avif',
  'Fuel': '/images/fuel-filter.avif',
  'Housing': '/images/pelon-air_converted.avif',
  'Hydraulic': '/images/hidraulic.avif',
  'Kits': '/images/npr-01_converted.avif',
  'Marine': '/images/marino-taller.avif',
  'Oil': '/images/oil-instalado.avif',
  'Water': '/images/fuelseparator.avif',
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export default function SystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navigation />

      {/* Hero Section */}
      <section
        style={{
          marginTop: '72px',
          paddingTop: '5rem',
          paddingBottom: '5rem',
          backgroundImage: 'url(/images/system-hero.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 100%)',
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {catalogue.products.map((product) => {
              const slug = getSlug(product.name);
              return (
                <motion.div
                  key={product.name}
                  variants={cardVariants}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(255,241,45,0.12)' }}
                >
                  <Link
                    href={`/products/${slug}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
                  >
                    <div
                      style={{
                        background: 'linear-gradient(160deg, rgba(255,241,45,0.06) 0%, rgba(0,0,0,0.2) 100%)',
                        border: '1px solid rgba(255,241,45,0.18)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'border-color 0.3s ease',
                      }}
                    >
                      {/* Product image */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '210px',
                          flexShrink: 0,
                          background: '#0a0a0a',
                          borderBottom: '1px solid rgba(255,241,45,0.08)',
                        }}
                      >
                        {productImages[product.name] ? (
                          <Image
                            src={productImages[product.name]}
                            alt={displayNames[product.name] || product.name}
                            fill
                            style={{ objectFit: 'contain', padding: '0.75rem' }}
                            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'rgba(255,241,45,0.03)' }} />
                        )}
                      </div>

                      {/* Title + subtitle + CTA */}
                      <div
                        style={{
                          padding: '1.5rem 1.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          flexGrow: 1,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            fontFamily: 'Space Grotesk, sans-serif',
                            color: 'rgba(255,255,255,0.92)',
                            margin: 0,
                          }}
                        >
                          {displayNames[product.name] || product.name}
                        </h3>
                        {product.subtitle && (
                          <p
                            style={{
                              fontSize: '0.75rem',
                              color: '#FFF12D',
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 500,
                              letterSpacing: '0.05em',
                              margin: 0,
                            }}
                          >
                            {product.subtitle}
                          </p>
                        )}
                        <span
                          style={{
                            display: 'inline-block',
                            color: '#FFF12D',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontFamily: 'Outfit, sans-serif',
                            letterSpacing: '0.1em',
                            marginTop: 'auto',
                            paddingTop: '0.75rem',
                          }}
                        >
                          LEARN MORE →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
