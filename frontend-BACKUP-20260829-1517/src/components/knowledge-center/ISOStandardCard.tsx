'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface ISOStandardCardProps {
  code: string;
  title?: string;
  scope?: string;
  href?: string;
}

export default function ISOStandardCard({ code, title, scope, href }: ISOStandardCardProps) {
  const inner = (
    <motion.div
      whileHover={href ? { background: 'rgba(255,241,45,0.06)' } : {}}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '0.6rem 0.875rem',
        transition: 'background 0.2s',
      }}
    >
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#FFF12D',
        marginBottom: title || scope ? '0.25rem' : '0',
      }}>
        {code}
      </p>
      {title && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.4,
        }}>
          {title}
        </p>
      )}
      {!title && scope && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.4,
        }}>
          {scope}
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
