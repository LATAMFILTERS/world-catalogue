'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface FamilyCardProps {
  name: string;
  description?: string;
  href?: string;
  productCount?: number;
}

export default function FamilyCard({ name, description, href, productCount }: FamilyCardProps) {
  const inner = (
    <motion.div
      whileHover={{ borderColor: 'rgba(255,241,45,0.25)' }}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '1.1rem',
        transition: 'border-color 0.2s',
      }}
    >
      <p style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        fontSize: '0.92rem',
        color: '#fff',
        marginBottom: description ? '0.3rem' : '0',
        lineHeight: 1.25,
      }}>
        {name}
      </p>
      {description && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      )}
      {productCount !== undefined && (
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.58rem',
          color: 'rgba(255,241,45,0.5)',
          marginTop: '0.5rem',
          letterSpacing: '0.06em',
        }}>
          {productCount} PRODUCTS
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
