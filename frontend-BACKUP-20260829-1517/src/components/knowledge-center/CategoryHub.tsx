'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface CategoryHubItem {
  id?: string;
  title: string;
  description?: string;
  href: string;
  label?: string;
  badge?: string;
}

export interface CategoryHubProps {
  items: CategoryHubItem[];
  minColumnWidth?: string;
}

export default function CategoryHub({ items, minColumnWidth = '240px' }: CategoryHubProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`,
      gap: '0.75rem',
    }}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,241,45,0.02)' }}
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '1.25rem',
              transition: 'border-color 0.2s, background 0.2s',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            {item.label && (
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                fontWeight: 700,
                color: '#FFF12D',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}>
                {item.label}
              </p>
            )}
            {item.id && (
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.06em',
                marginBottom: '0.3rem',
              }}>
                {item.id}
              </p>
            )}
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#fff',
              lineHeight: 1.25,
              marginBottom: item.description ? '0.4rem' : '0',
            }}>
              {item.title}
            </p>
            {item.description && (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.5,
              }}>
                {item.description}
              </p>
            )}
            {item.badge && (
              <span style={{
                display: 'inline-block',
                marginTop: '0.6rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '0.15rem 0.4rem',
                letterSpacing: '0.06em',
              }}>
                {item.badge}
              </span>
            )}
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
