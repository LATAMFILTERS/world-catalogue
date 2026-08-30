'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

interface NetworkProfilePageProps {
  currentPageEn: string;
  currentPageEs: string;
  eyebrowEn: string;
  eyebrowEs: string;
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
  images: { src: string; altEn: string; altEs: string }[];
}

export function NetworkProfilePage({
  currentPageEn, currentPageEs, eyebrowEn, eyebrowEs, titleEn, titleEs, bodyEn, bodyEs, images,
}: NetworkProfilePageProps) {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  return (
    <main id="main-content" style={main}>
      <PageHeader
        breadcrumbs={[
          { label: 'About', href: '/about' },
          { label: isSpanish ? 'Quiénes Somos' : 'Who We Are', href: '/about/who-we-are' },
          { label: isSpanish ? 'Red Global' : 'Global Network', href: '/about/who-we-are/network' },
        ]}
        currentPage={isSpanish ? currentPageEs : currentPageEn}
      />

      <section style={heroSection}>
        <div style={wrap}>
          <p style={eyebrow}>{isSpanish ? eyebrowEs : eyebrowEn}</p>
          <h1 style={title}>{isSpanish ? titleEs : titleEn}</h1>
        </div>
      </section>

      <section style={contentSection}>
        <div style={contentGrid}>
          <div style={photoColumn}>
            {images.map((img) => (
              <div key={img.src} style={photoShell}>
                <img src={img.src} alt={isSpanish ? img.altEs : img.altEn} style={photoImage} />
              </div>
            ))}
          </div>
          <p style={bodyText}>{isSpanish ? bodyEs : bodyEn}</p>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem) clamp(2rem,4vw,3rem)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase' };
const title: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.04em', lineHeight: .95, fontSize: 'clamp(2.4rem,5vw,4.5rem)', margin: 0, textTransform: 'uppercase' };
const contentSection: CSSProperties = { background: '#050505', padding: 'clamp(2rem,6vw,4rem) clamp(1.25rem,6vw,6rem) clamp(6rem,10vw,8rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const contentGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' };
const photoColumn: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' };
const photoShell: CSSProperties = { aspectRatio: '4 / 3', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.1)' };
const photoImage: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,.75)', lineHeight: 1.85, fontSize: '1.08rem', maxWidth: '620px' };
