'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface KCTechnologyCardProps {
  name: string;
  domain?: string;
  tagline?: string;
  href?: string;
}

export default function KCTechnologyCard({ name, domain, tagline, href }: KCTechnologyCardProps) {
  const inner = (
    <motion.div
      whileHover={href ? { borderColor: 'rgba(255,241,45,0.25)' } : {}}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '0.6rem 0.875rem',
        transition: 'border-color 0.2s',
      }}
    >
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: domain || tagline ? '0.2rem' : '0',
      }}>
        {name}
      </p>
      {domain && (
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          color: 'rgba(255,241,45,0.5)',
          letterSpacing: '0.06em',
        }}>
          {domain}
        </p>
      )}
      {!domain && tagline && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.35)',
        }}>
          {tagline}
        </p>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}
