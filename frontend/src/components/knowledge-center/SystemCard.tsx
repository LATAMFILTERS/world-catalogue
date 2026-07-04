'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface SystemCardProps {
  title: string;
  description?: string;
  href?: string;
  technologies?: string[];
}

export default function SystemCard({ title, description, href, technologies }: SystemCardProps) {
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
        marginBottom: description || technologies ? '0.35rem' : '0',
        lineHeight: 1.25,
      }}>
        {title}
      </p>
      {description && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.5,
          marginBottom: technologies ? '0.5rem' : '0',
        }}>
          {description}
        </p>
      )}
      {technologies && technologies.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {technologies.map((t) => (
            <span key={t} style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              color: 'rgba(255,241,45,0.6)',
              background: 'rgba(255,241,45,0.05)',
              padding: '0.15rem 0.4rem',
              letterSpacing: '0.04em',
            }}>
              {t}
            </span>
          ))}
        </div>
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
