'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

const ENTRIES = [
  { slug: 'fps', image: '/images/fps_oficinas.jpg', titleEn: 'FPS', titleEs: 'FPS', kindEn: 'Distributor Partner · Panama', kindEs: 'Socio Distribuidor · Panamá' },
  { slug: 'colsaisa', image: '/images/colsaisa_oficinas.jpg', titleEn: 'COLSAISA', titleEs: 'COLSAISA', kindEn: 'Distributor Partner · Colombia', kindEs: 'Socio Distribuidor · Colombia' },
  { slug: 'troy', image: '/images/troy_rd.jpg', titleEn: 'TROY', titleEs: 'TROY', kindEn: 'Exclusive Distributor · Dominican Republic', kindEs: 'Distribuidor Exclusivo · República Dominicana' },
  { slug: 'mercofilter', image: '/images/mercofilter_vzla.jpg', titleEn: 'Mercofilter', titleEs: 'Mercofilter', kindEn: 'Distributor Partner · Venezuela', kindEs: 'Socio Distribuidor · Venezuela' },
];

export default function NetworkHubPage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  return (
    <main id="main-content" style={main}>
      <PageHeader
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: isSpanish ? 'Quiénes Somos' : 'Who We Are', href: '/about/who-we-are' }]}
        currentPage={isSpanish ? 'Red Global' : 'Global Network'}
      />

      <section style={heroSection}>
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? 'RED GLOBAL' : 'GLOBAL NETWORK'}</p>
          <h1 style={heroTitle}>{isSpanish ? 'Los socios detrás de la expansión.' : 'The partners behind the expansion.'}</h1>
          <p style={heroLead}>
            {isSpanish
              ? 'Los socios distribuidores que llevaron ELIMFILTERS a nuevos mercados, y las operaciones logísticas que mantienen la marca en movimiento.'
              : 'The distributor partners who carried ELIMFILTERS into new markets, and the logistics operations that keep the brand moving.'}
          </p>
        </div>
      </section>

      <section style={gridSection}>
        <div style={wrap}>
          <div style={grid}>
            {ENTRIES.map((entry) => (
              <Link key={entry.slug} href={`/about/who-we-are/network/${entry.slug}`} style={card}>
                <div style={cardPhotoShell}>
                  <img src={entry.image} alt={isSpanish ? entry.titleEs : entry.titleEn} style={cardPhoto} />
                </div>
                <p style={cardKind}>{isSpanish ? entry.kindEs : entry.kindEn}</p>
                <h2 style={cardTitle}>{isSpanish ? entry.titleEs : entry.titleEn}</h2>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem) clamp(3rem,5vw,4rem)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase' };
const heroTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.04em', lineHeight: .98, fontSize: 'clamp(2.4rem,5vw,4.5rem)', margin: '0 0 1.25rem', textTransform: 'uppercase', maxWidth: '900px' };
const heroLead: CSSProperties = { color: 'rgba(255,255,255,.72)', lineHeight: 1.75, maxWidth: '760px', fontSize: '1.03rem' };
const gridSection: CSSProperties = { background: '#050505', padding: '0 clamp(1.25rem,6vw,6rem) clamp(6rem,10vw,8rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const grid: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)', marginTop: '3rem' };
const card: CSSProperties = { background: '#080808', textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', flex: '1 1 280px', minWidth: 0 };
const cardPhotoShell: CSSProperties = { aspectRatio: '4 / 3', overflow: 'hidden', background: '#111' };
const cardPhoto: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const cardKind: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.1em', fontSize: '.66rem', textTransform: 'uppercase', margin: '1.5rem 2rem 0.5rem' };
const cardTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-.02em', textTransform: 'uppercase', margin: '0 2rem 2rem' };
