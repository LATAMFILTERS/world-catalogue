'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface ArticleHeroProps {
  overline: string;
  title: string;
  titleVariant?: 'display' | 'code';
  subtitle?: string;
  intro?: string;
  gradient?: boolean;
  maxWidth?: string;
  children?: React.ReactNode;
}

export default function ArticleHero({
  overline,
  title,
  titleVariant = 'display',
  subtitle,
  intro,
  gradient = true,
  maxWidth = '1200px',
  children,
}: ArticleHeroProps) {
  const containerMaxWidth = maxWidth === '860px' ? '1200px' : maxWidth;

  return (
    <section style={{
      background: gradient ? 'linear-gradient(160deg, #080808 0%, #000 100%)' : '#000',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
    }}>
      <div style={{ maxWidth: containerMaxWidth, width: '100%', margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: '#FFF12D',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
          }}
        >
          {overline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          style={titleVariant === 'code' ? {
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
            color: '#FFF12D',
            marginBottom: subtitle ? '0.5rem' : '1.25rem',
            lineHeight: 1.1,
            maxWidth: '1000px',
          } : {
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            lineHeight: 1.12,
            textWrap: 'balance',
            marginBottom: subtitle ? '0.75rem' : '1.25rem',
            maxWidth: '1000px',
          }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: intro || children ? '1.5rem' : '0',
              maxWidth: '900px',
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {intro && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '860px',
              marginBottom: children ? '1rem' : '0',
            }}
          >
            {intro}
          </motion.p>
        )}

        {children}
      </div>
    </section>
  );
}
