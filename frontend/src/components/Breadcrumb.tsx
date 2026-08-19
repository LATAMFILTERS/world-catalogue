'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SEGMENT_LABELS: Record<string, string> = {
  'industries': 'INDUSTRIES',
  'systems': 'SYSTEMS',
  'technologies': 'TECHNOLOGIES',
  'knowledge-system': 'KNOWLEDGE',
  'contact': 'CONTACT',
  'about': 'ABOUT',
  'warranty': 'WARRANTY',
  'standards': 'STANDARDS',
  'contamination': 'CONTAMINATION',
  'fleet': 'FLEET',
  'compare': 'COMPARE',
  'bridges': 'BRIDGES',
  'science': 'SCIENCE',
  // industries
  'agriculture': 'AGRICULTURE',
  'automotive': 'AUTOMOTIVE',
  'bus-coach': 'BUS & COACH',
  'construction': 'CONSTRUCTION',
  'manufacturing': 'MANUFACTURING',
  'marine': 'MARINE',
  'mining': 'MINING',
  'oil-gas': 'OIL & GAS',
  'power-generation': 'POWER GENERATION',
  'railway': 'RAILWAY',
  'trucks-fleets': 'TRUCKS & FLEETS',
  'waste-municipal': 'WASTE & MUNICIPAL',
  // technologies
  'macrocore': 'MACROCORE',
  'nanoforce': 'NANOFORCE',
  'syntrax': 'SYNTRAX',
  'HYDROCORE': 'HYDROCORE',
  'SYNTAPORE': 'SYNTAPORE',
  'drycore': 'DRYCORE',
  'intekcore': 'INTEKCORE',
  'thermacore': 'THERMACORE',
  'microkappa': 'MICROKAPPA',
  'duratech': 'DURATECH',
  // systems / products
  'airfilter': 'AIR FILTER',
  'fuel': 'FUEL FILTER',
  'hydraulic': 'HYDRAULIC',
  'oil': 'OIL FILTER',
  'cabin': 'CABIN FILTER',
  'coolant': 'COOLANT',
  'dryer': 'AIR DRYER',
  'housing': 'HOUSING',
  'kits': 'SERVICE KITS',
  'water': 'WATER SEPARATOR',
  'turbocore-series': 'HYDROCORE',
  // knowledge standards
  'lube-oil-systems': 'LUBE OIL SYSTEMS',
  'air-intake-systems': 'AIR INTAKE SYSTEMS',
  'cabin-safety-systems': 'CABIN SAFETY SYSTEMS',
  'fuel-systems': 'FUEL SYSTEMS',
  'hydraulic-systems': 'HYDRAULIC SYSTEMS',
  'compressed-air-systems': 'COMPRESSED AIR',
  'iso-16889': 'ISO 16889',
  'iso-4406': 'ISO 4406',
  'iso-5011': 'ISO 5011',
  // contamination
  'diesel-water': 'DIESEL WATER',
  'particle-wear': 'PARTICLE WEAR',
  'hydraulic-system': 'HYDRAULIC SYSTEM',
  // fleet
  'reducing-downtime': 'REDUCING DOWNTIME',
  'fuel-efficiency': 'FUEL EFFICIENCY',
  'total-cost-ownership': 'TOTAL COST',
  // compare
  'system-vs-commodity': 'SYSTEM VS COMMODITY',
  'oem-comparison': 'OEM COMPARISON',
  'evaluation-framework': 'EVALUATION FRAMEWORK',
  // bridges
  'aftermarket-selection': 'AFTERMARKET',
  'fleet-solutions': 'FLEET SOLUTIONS',
  'industrial-filtration': 'INDUSTRIAL FILTRATION',
  'oem-replacement': 'OEM REPLACEMENT',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg.toUpperCase().replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 20,
        background: 'rgba(0,0,0,0.65)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0.7rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          HOME
        </Link>

        {crumbs.map((crumb) => (
          <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace' }}>
              →
            </span>
            {crumb.isLast ? (
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  color: '#FFF12D',
                }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
