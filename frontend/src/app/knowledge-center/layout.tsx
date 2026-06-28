'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/knowledge-center', label: 'Overview' },
  { href: '/knowledge-center/engineering', label: 'Engineering' },
  { href: '/knowledge-center/standards', label: 'Standards' },
  { href: '/knowledge-center/systems', label: 'Systems' },
  { href: '/knowledge-center/industries', label: 'Industries' },
  { href: '/knowledge-center/technical-library', label: 'Library' },
  { href: '/knowledge-center/technical-doctrine', label: 'Tech Doctrine' },
  { href: '/knowledge-center/commercial-doctrine', label: 'Commercial' },
];

export default function KnowledgeCenterLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.95)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          overflowX: 'auto',
        }}>
          <Link href="/" style={{
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '1rem 1.25rem 1rem 0',
            marginRight: '1rem',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em',
          }}>
            ELIMFILTERS
          </Link>
          {NAV.map((item) => {
            const active = path === item.href || (item.href !== '/knowledge-center' && path.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                color: active ? '#FFF12D' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                padding: '1rem 0.875rem',
                whiteSpace: 'nowrap',
                borderBottom: active ? '2px solid #FFF12D' : '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
              }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </div>
  );
}
