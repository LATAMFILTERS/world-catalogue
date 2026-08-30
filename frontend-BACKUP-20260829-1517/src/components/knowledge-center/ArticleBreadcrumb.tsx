'use client';

import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ArticleBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function ArticleBreadcrumb({ items }: ArticleBreadcrumbProps) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0.875rem clamp(1.5rem, 4vw, 4rem)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {i > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.2)',
              }}>›</span>
            )}
            {item.href ? (
              <Link href={item.href} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.3)',
                textDecoration: 'none',
              }}>
                {item.label}
              </Link>
            ) : (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: i === items.length - 1 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
              }}>
                {item.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
