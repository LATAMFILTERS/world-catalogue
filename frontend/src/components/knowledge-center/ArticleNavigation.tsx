'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface ArticleNavigationItem {
  title: string;
  href: string;
}

export interface ArticleNavigationProps {
  prev?: ArticleNavigationItem;
  next?: ArticleNavigationItem;
}

export default function ArticleNavigation({ prev, next }: ArticleNavigationProps) {
  if (!prev && !next) return null;

  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 4vw, 4rem)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {prev ? (
        <Link href={prev.href} style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ borderColor: 'rgba(255,241,45,0.25)' }}
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '1rem 1.25rem',
              transition: 'border-color 0.2s',
            }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: '0.4rem',
            }}>
              ← PREVIOUS
            </p>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.3,
            }}>
              {prev.title}
            </p>
          </motion.div>
        </Link>
      ) : <div />}

      {next && (
        <Link href={next.href} style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ borderColor: 'rgba(255,241,45,0.25)' }}
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '1rem 1.25rem',
              textAlign: 'right',
              transition: 'border-color 0.2s',
            }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: '0.4rem',
            }}>
              NEXT →
            </p>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.3,
            }}>
              {next.title}
            </p>
          </motion.div>
        </Link>
      )}
    </div>
  );
}
