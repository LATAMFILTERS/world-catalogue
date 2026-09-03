import type { Metadata } from 'next';
import { motion } from 'motion/react';

export const metadata: Metadata = {
  title: 'Page Not Found | ELIMFILTERS',
  description: 'The requested ELIMFILTERS page could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      aria-labelledby="not-found-title"
      style={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        background: '#000',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(1.5rem, 5vw, 4rem)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 45%, rgba(255,241,45,0.10), transparent 24%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: 'auto, 42px 42px, 42px 42px',
          maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 'min(74vw, 780px)',
          aspectRatio: '1',
          border: '1px solid rgba(255,241,45,0.16)',
          borderRadius: '50%',
          boxShadow:
            '0 0 0 34px rgba(255,241,45,0.025), 0 0 0 68px rgba(255,241,45,0.018)',
        }}
      />

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'min(100%, 920px)',
          textAlign: 'center',
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            margin: '0 0 1.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 'clamp(0.64rem, 1.5vw, 0.78rem)',
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#FFF12D',
          }}
        >
          ELIMFILTERS // ROUTE CONTROL
        </motion.p>

        <motion.h1
          id="not-found-title"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          style={{
            margin: 0,
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(8rem, 30vw, 20rem)',
            fontWeight: 800,
            lineHeight: 0.76,
            letterSpacing: '-0.075em',
            color: '#FFF12D',
            textShadow: '0 0 50px rgba(255,241,45,0.14)',
          }}
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{ marginTop: 'clamp(2rem, 6vw, 4.5rem)' }}
        >
          <p
            style={{
              margin: '0 0 1rem',
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: 'clamp(1.45rem, 4.5vw, 2.6rem)',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Path outside the protection system.
          </p>

          <p
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.52)',
            }}
          >
            The requested page, link, or automated route is not active within ELIMFILTERS.
            No product, technical record, or commercial destination exists at this address.
          </p>
        </motion.div>

        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          style={{
            width: '86px',
            height: '4px',
            margin: '2.2rem auto 0',
            background: '#FFF12D',
            transformOrigin: 'center',
          }}
        />
      </section>
    </main>
  );
}
