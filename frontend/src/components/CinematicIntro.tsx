'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  logoSrc: string;
  heroTitle: string;
  categoryTag: string;
}

export function CinematicIntro({ logoSrc, heroTitle, categoryTag }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hold for 3.5 seconds, then begin exit
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: [0.4, 0, 0.6, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Category label — top */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            style={{
              position: 'absolute',
              top: '2.5rem',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(0.55rem, 0.9vw, 0.7rem)',
              letterSpacing: '0.3em',
              color: 'rgba(255,241,45,0.65)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {categoryTag}
          </motion.p>

          {/* Logo image — centered, full presence */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '0 8%',
            }}
          >
            <img
              src={logoSrc}
              alt={heroTitle}
              style={{
                display: 'block',
                width: 'clamp(260px, 44vw, 680px)',
                height: 'auto',
                mixBlendMode: 'screen',
                filter: 'brightness(1.1) contrast(1.05)',
                userSelect: 'none',
              }}
            />
          </motion.div>

          {/* Horizontal accent line — draws under logo */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: '2.5rem',
              width: 'clamp(60px, 8vw, 120px)',
              height: '1px',
              background: 'linear-gradient(to right, rgba(255,241,45,0.7), rgba(255,241,45,0.1))',
              transformOrigin: 'left center',
            }}
          />

          {/* ELIMFILTERS mark — bottom */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            transition={{ duration: 0.9, delay: 1.4 }}
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(0.5rem, 0.8vw, 0.62rem)',
              letterSpacing: '0.22em',
              color: '#fff',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            ELIMFILTERS · INDUSTRIAL ASSET PROTECTION
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
