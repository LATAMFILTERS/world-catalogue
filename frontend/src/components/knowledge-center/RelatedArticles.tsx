'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export interface RelatedArticleItem {
  title: string;
  href: string;
  description?: string;
  label?: string;
  meta?: string;
}

export interface RelatedArticlesProps {
  items: RelatedArticleItem[];
  title?: string;
  minColumnWidth?: string;
}

export default function RelatedArticles({
  items,
  title = 'RELATED TOPICS',
  minColumnWidth = '220px',
}: RelatedArticlesProps) {
  if (items.length === 0) return null;

  return (
    <section style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingTop: '2.5rem',
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: '1.25rem',
      }}>
        {title}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`,
        gap: '0.75rem',
      }}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '1.1rem',
                transition: 'border-color 0.2s',
              }}
            >
              {item.label && (
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  color: '#FFF12D',
                  letterSpacing: '0.1em',
                  marginBottom: '0.35rem',
                }}>
                  {item.label}
                </p>
              )}
              <p style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#fff',
                marginBottom: item.description || item.meta ? '0.25rem' : '0',
                lineHeight: 1.25,
              }}>
                {item.title}
              </p>
              {item.description && (
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.4,
                }}>
                  {item.description}
                </p>
              )}
              {!item.description && item.meta && (
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  {item.meta}
                </p>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
