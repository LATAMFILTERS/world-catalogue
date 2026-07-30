'use client';

import Link from 'next/link';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Breadcrumb[];
  currentPage?: string;
}

export function PageHeader({ breadcrumbs, currentPage }: PageHeaderProps) {
  // Build breadcrumb trail: HOME / [parent] / [current]
  const trail: Breadcrumb[] = [{ label: 'HOME', href: '/' }];

  if (breadcrumbs) {
    trail.push(...breadcrumbs);
  }

  if (currentPage) {
    trail.push({ label: currentPage });
  }

  return (
    <div style={{
      position: 'fixed',
      top: '1.1rem',
      right: '1.35rem',
      zIndex: 50,
      background: 'rgba(0,0,0,0.78)',
      border: '1px solid rgba(255,241,45,0.45)',
      borderRadius: '0',
      backdropFilter: 'blur(14px)',
      padding: '0.8rem 1.15rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'nowrap',
      fontFamily: 'var(--font-display)',
      fontSize: '0.78rem',
      letterSpacing: '0.16em',
      fontWeight: 700,
    }}>
      {trail.map((crumb, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {crumb.href ? (
            <Link href={crumb.href} style={{
              color: '#FFF12D',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: '#FFF12D' }}>{crumb.label}</span>
          )}
          {idx < trail.length - 1 && (
            <span style={{ color: 'rgba(255,241,45,0.35)', fontSize: '0.65rem' }}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}
