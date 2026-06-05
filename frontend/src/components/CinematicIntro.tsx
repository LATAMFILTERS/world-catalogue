'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  heroImage: string;
  heroTitle: string;
  categoryTag: string;
  logoSrc?: string;
}

export function CinematicIntro({ heroImage, heroTitle, categoryTag, logoSrc }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.75, ease: [0.7, 0, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            overflow: 'hidden',
            background: '#000',
            pointerEvents: 'none',
          }}
        >
          {/* Hero image — Ken Burns slow zoom */}
          <motion.div
            initial={{ scale: 1.14, filter: 'brightness(0.55)' }}
            animate={{ scale: 1.0, filter: 'brightness(0.72)' }}
            transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: '-4%',
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 40%',
            }}
          />

          {/* Vignette — dark edges, brighter center */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.88) 100%)',
          }} />

          {/* Bottom gradient for text legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 45%)',
          }} />

          {/* Content — bottom-left cinematic positioning */}
          <div style={{
            position: 'absolute',
            bottom: '12%',
            left: '7%',
            right: '7%',
          }}>
            {/* Category tag */}
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                letterSpacing: '0.28em',
                color: '#FFF12D',
                textTransform: 'uppercase',
                margin: '0 0 0.75rem 0',
                opacity: 0,
              }}
            >
              {categoryTag}
            </motion.p>

            {/* Tech name — main title */}
            <div style={{ overflow: 'hidden' }}>
              <motion.h1
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(3.5rem, 10vw, 10rem)',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.025em',
                  lineHeight: 0.92,
                  margin: 0,
                }}
              >
                {heroTitle}
              </motion.h1>
            </div>

            {/* Accent line — draws left to right */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: '1.25rem',
                height: '2px',
                width: 'clamp(80px, 12vw, 180px)',
                background: 'linear-gradient(to right, #FFF12D, rgba(255,241,45,0.3))',
                transformOrigin: 'left center',
              }}
            />

            {/* Logo — fades in after line */}
            {logoSrc && (
              <motion.img
                src={logoSrc}
                alt={heroTitle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.85, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                style={{
                  display: 'block',
                  marginTop: '1.5rem',
                  height: 'clamp(32px, 4vw, 52px)',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
              />
            )}
          </div>

          {/* Top-right: subtle ELIMFILTERS® mark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2.5rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: '#fff',
              textTransform: 'uppercase',
            }}
          >
            ELIMFILTERS®
          </motion.div>

          {/* Scan-line texture — subtle cinematic film grain feel */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
