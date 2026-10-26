'use client';

import Link from '@/components/LocalizedLink';
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
  minColumnWidth = '320px',
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
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minColumnWidth}), 1fr))`,
        gap: '1rem',
        alignItems: 'stretch',
      }}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block', height: '100%', minWidth: 0 }}>
            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '1.25rem',
                minHeight: '154px',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.018)',
                transition: 'border-color 0.2s, background 0.2s',
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
                fontSize: 'clamp(1rem, 1.1vw, 1.15rem)',
                overflowWrap: 'break-word',
                textAlign: 'left',
                color: '#fff',
                marginBottom: item.description || item.meta ? '0.25rem' : '0',
                lineHeight: 1.4,
              }}>
                {item.title}
              </p>
              {item.description && (
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.84rem',
                  color: 'rgba(255,255,255,0.68)',
                  lineHeight: 1.4,
                }}>
                  {item.description}
                </p>
              )}
              {!item.description && item.meta && (
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.60)',
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
