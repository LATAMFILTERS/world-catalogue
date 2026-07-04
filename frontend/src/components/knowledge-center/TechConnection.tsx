'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface TechConnectionProps {
  technology: string;
  standard?: string;
  mechanism?: string;
  href?: string;
}

export default function TechConnection({
  technology,
  standard,
  mechanism,
  href,
}: TechConnectionProps) {
  const inner = (
    <motion.div
      whileHover={href ? { borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,241,45,0.02)' } : {}}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '1rem 1.25rem',
        transition: 'border-color 0.2s, background 0.2s',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#FFF12D',
        background: 'rgba(255,241,45,0.08)',
        padding: '0.2rem 0.4rem',
        whiteSpace: 'nowrap',
        marginTop: '0.1rem',
        flexShrink: 0,
      }}>
        {technology}
      </div>
      <div>
        {standard && (
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,241,45,0.6)',
            marginBottom: mechanism ? '0.2rem' : '0',
          }}>
            {standard}
          </p>
        )}
        {mechanism && (
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.45,
          }}>
            {mechanism}
          </p>
        )}
      </div>
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
