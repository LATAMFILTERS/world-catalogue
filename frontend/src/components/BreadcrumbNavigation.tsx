'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackNavigationClick, trackContextualLink } from '@/lib/analytics';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

const BREADCRUMB_LABELS: Record<string, string> = {
  '': 'Home',
  'knowledge-system': 'Knowledge System',
  'standards': 'Standards',
  'contamination': 'Contamination',
  'fleet': 'Fleet Optimization',
  'technologies': 'Technologies',
  'industries': 'Industries',
  'systems': 'Systems',
  'families': 'Product Families',
  'about': 'About',
  'contact': 'Contact',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: BREADCRUMB_LABELS[''] || 'Home', href: '/', isCurrentPage: segments.length === 0 },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isCurrentPage = index === segments.length - 1;
    const label = BREADCRUMB_LABELS[segment] || segment.replace(/-/g, ' ');

    breadcrumbs.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href: currentPath,
      isCurrentPage,
    });
  });

  return breadcrumbs;
}

export function BreadcrumbNavigation() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    setBreadcrumbs(generateBreadcrumbs(pathname));
  }, [pathname]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '1rem 2rem',
        fontSize: '0.875rem',
      }}
      aria-label="Breadcrumb"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {crumb.isCurrentPage ? (
              <span style={{ color: '#FFF12D', fontWeight: 500 }}>{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                onClick={() => {
                  trackNavigationClick('breadcrumb', crumb.label.toLowerCase().replace(/\s+/g, '_'), 'breadcrumb');
                }}
                style={{
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#FFF12D';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
                }}
              >
                {crumb.label}
              </Link>
            )}

            {index < breadcrumbs.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>→</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
