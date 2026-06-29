'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/product-experience', label: 'Overview' },
  { href: '/product-experience/systems/air-intake', label: 'Air Intake' },
  { href: '/product-experience/systems/fuel-cleanliness', label: 'Fuel' },
  { href: '/product-experience/systems/lubrication', label: 'Lube' },
  { href: '/product-experience/systems/hydraulic', label: 'Hydraulic' },
  { href: '/product-experience/systems/cooling-system', label: 'Cooling' },
  { href: '/product-experience/systems/cabin-air', label: 'Cabin' },
  { href: '/product-experience/systems/compressed-air', label: 'Compressed Air' },
  { href: '/product-experience/families', label: 'Families' },
  { href: '/product-experience/search', label: 'Search' },
];

export default function PEPClientNav() {
  const path = usePathname();
  return (
    <nav style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.95)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1400px',
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
        <Link href="/product-experience" style={{
          color: 'rgba(255,241,45,0.6)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          textDecoration: 'none',
          padding: '1rem 1rem 1rem 0',
          marginRight: '0.5rem',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.08em',
        }}>
          PRODUCT EXPERIENCE
        </Link>
        {NAV.map((item) => {
          const active = path === item.href ||
            (item.href !== '/product-experience' && item.href !== '/product-experience/families' && item.href !== '/product-experience/search' && path.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={{
              color: active ? '#FFF12D' : 'rgba(255,255,255,0.5)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.78rem',
              fontWeight: active ? 600 : 400,
              textDecoration: 'none',
              padding: '1rem 0.75rem',
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
  );
}
