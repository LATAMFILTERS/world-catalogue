'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import {
  INDUSTRIAL_PROCESS_PLATFORMS,
  industrialProcessPlatformUrl,
  industrialProcessTechnologyUrl,
  localizeIndustrialProcessPlatform,
  type IndustrialProcessPlatform,
} from '@/lib/industrial-process-architecture';

interface PlatformStandards {
  platform: IndustrialProcessPlatform;
  standards: readonly string[];
}

const PROJECT_INPUT_KEYS = [
  'processFluidOrGas',
  'contaminantObjective',
  'flowRate',
  'operatingPressure',
  'temperature',
  'efficiencyTarget',
  'applicableStandard',
  'materialsCompatibility',
  'existingHousing',
] as const;

const inquiryHref =
  'mailto:info@elimfilters.com?subject=Industrial%20%26%20Process%20Engineering%20Review&body=Company%3A%0ACountry%3A%0AIndustry%20%2F%20process%3A%0AApplication%3A%0AFluid%20or%20gas%3A%0AFlow%3A%0APressure%3A%0ATemperature%3A%0AContaminant%20or%20treatment%20objective%3A%0AExisting%20equipment%20%2F%20reference%3A%0AProject%20timing%3A';

export function IndustrialProcessLandingStablePage({ platformStandards }: { platformStandards: PlatformStandards[] }) {
  const { t, i18n } = useTranslation();
  const platforms = INDUSTRIAL_PROCESS_PLATFORMS.map((platform) => localizeIndustrialProcessPlatform(platform, i18n.language));
  const localizedPlatformStandards = platformStandards.map(({ platform, standards }) => ({
    platform: localizeIndustrialProcessPlatform(platform, i18n.language),
    standards,
  }));

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <section
        style={{
          position: 'relative',
          minHeight: '82vh',
          display: 'flex',
          alignItems: 'end',
          overflow: 'hidden',
          padding: 'clamp(8rem, 16vw, 13rem) var(--section-px) clamp(4.5rem, 9vw, 7rem)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background:
            'radial-gradient(circle at 82% 22%, rgba(255,241,45,0.12), transparent 27%), linear-gradient(145deg,#000 0%,#050505 62%,#0b0b0b 100%)',
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: VIDEO_HERO_TREATMENT.opacity,
            zIndex: 0,
          }}
        >
          <source src="/images/presentacion.mp4" type="video/mp4" />
        </video>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: VIDEO_HERO_TREATMENT.overlayBackground,
            zIndex: 1,
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1400, margin: '0 auto' }}>
          <p style={eyebrow}>{t('industrialProcess.hero.eyebrow')}</p>
          <h1 style={heroTitle}>
            {t('industrialProcess.hero.titleLine1')}
            <span style={{ display: 'block', color: '#FFF12D' }}>{t('industrialProcess.hero.titleLine2')}</span>
          </h1>
          <p style={heroCopy}>{t('industrialProcess.hero.copy')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <a href={inquiryHref} data-conversion-action="industrial-engineering-review" style={primaryButton}>
              {t('industrialProcess.hero.ctaPrimary')}
            </a>
            <a href="#platforms" style={secondaryButton}>{t('industrialProcess.hero.ctaSecondary')}</a>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="industrial-entry-title">
        <div style={container}>
          <div style={twoCol}>
            <div>
              <p style={eyebrow}>{t('industrialProcess.entry.eyebrow')}</p>
              <h2 id="industrial-entry-title" style={sectionTitle}>{t('industrialProcess.entry.title')}</h2>
            </div>
            <div>
              <p style={lead}>{t('industrialProcess.entry.lead')}</p>
              <p style={bodyCopy}>{t('industrialProcess.entry.body')}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="platforms" style={{ ...section, background: '#050505' }} aria-labelledby="platform-title">
        <div style={container}>
          <p style={eyebrow}>{t('industrialProcess.platforms.eyebrow')}</p>
          <h2 id="platform-title" style={sectionTitle}>{t('industrialProcess.platforms.title')}</h2>
          <div style={platformGrid}>
            {platforms.map((platform, index) => (
              <article key={platform.slug} style={platformCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
                  <span style={numberStyle}>{String(index + 1).padStart(2, '0')}</span>
                  <span style={platformDescriptor}>{platform.descriptor}</span>
                </div>
                <Link href={industrialProcessPlatformUrl(platform.slug)} style={{ color: '#fff', textDecoration: 'none' }}>
                  <h3 style={platformMark}>{platform.name}</h3>
                </Link>
                <p style={bodyCopy}>{platform.summary}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 22, paddingTop: 16 }}>
                  {platform.technologies.map((technology) => (
                    <Link
                      key={technology.slug}
                      href={industrialProcessTechnologyUrl(platform.slug, technology.slug)}
                      style={{ ...familyRow, display: 'block', textDecoration: 'none' }}
                    >
                      {technology.name === technology.title ? technology.name : `${technology.name} — ${technology.title}`}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...section, background: '#050505' }} aria-labelledby="standards-title">
        <div style={container}>
          <p style={eyebrow}>{t('industrialProcess.standards.eyebrow')}</p>
          <h2 id="standards-title" style={sectionTitle}>{t('industrialProcess.standards.title')}</h2>
          <p style={{ ...lead, maxWidth: 980 }}>{t('industrialProcess.standards.lead')}</p>
          <div style={platformGrid}>
            {localizedPlatformStandards.map(({ platform, standards }) => (
              <article key={platform.slug} style={platformCard}>
                <Link href={industrialProcessPlatformUrl(platform.slug)} style={{ color: '#fff', textDecoration: 'none' }}>
                  <h3 style={{ ...platformMark, marginTop: 0 }}>{platform.name}</h3>
                </Link>
                <p style={bodyCopy}>{platform.descriptor}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 18, paddingTop: 12 }}>
                  {standards.map((standard) => (
                    <div key={standard} style={specRow}><span>—</span><span>{standard}</span></div>
                  ))}
                </div>
                {platform.knowledgeCenterSlug ? (
                  <div style={{ marginTop: 18 }}>
                    <Link href={`/knowledge-center/canonical/${platform.knowledgeCenterSlug}/`} style={{ color: '#FFF12D', fontWeight: 700, textDecoration: 'none' }}>
                      {t('industrialProcess.standards.openReference')} →
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="qualification-title">
        <div style={container}>
          <div style={twoCol}>
            <div>
              <p style={eyebrow}>{t('industrialProcess.qualification.eyebrow')}</p>
              <h2 id="qualification-title" style={sectionTitle}>{t('industrialProcess.qualification.title')}</h2>
            </div>
            <div style={{ display: 'grid', gap: 0 }}>
              {PROJECT_INPUT_KEYS.map((key, index) => (
                <div key={key} style={requirementRow}>
                  <span style={numberStyle}>{String(index + 1).padStart(2, '0')}</span>
                  <span>{t(`industrialProcess.qualification.inputs.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...section, borderTop: '1px solid rgba(255,241,45,0.22)' }}>
        <div style={{ ...container, textAlign: 'center' }}>
          <p style={{ ...eyebrow, textAlign: 'center' }}>{t('industrialProcess.intake.eyebrow')}</p>
          <h2 style={{ ...sectionTitle, maxWidth: 900, margin: '0 auto 20px' }}>{t('industrialProcess.intake.title')}</h2>
          <p style={{ ...lead, maxWidth: 820, margin: '0 auto 28px', textAlign: 'center' }}>{t('industrialProcess.intake.lead')}</p>
          <a href={inquiryHref} data-conversion-action="industrial-engineering-review" style={primaryButton}>
            {t('industrialProcess.intake.cta')}
          </a>
          <div style={{ marginTop: 18 }}>
            <Link href="/contact/" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
              {t('industrialProcess.intake.generalContact')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const container: React.CSSProperties = { maxWidth: 1400, margin: '0 auto' };
const section: React.CSSProperties = { padding: 'var(--section-py) var(--section-px)', borderBottom: '1px solid rgba(255,255,255,0.07)' };
const eyebrow: React.CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.73rem', textTransform: 'uppercase', margin: '0 0 14px' };
const heroTitle: React.CSSProperties = { maxWidth: 1120, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(3.2rem,8vw,7.8rem)', lineHeight: 0.88, letterSpacing: '-0.055em', textTransform: 'uppercase', margin: 0 };
const heroCopy: React.CSSProperties = { maxWidth: 850, color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(1.05rem,2vw,1.35rem)', lineHeight: 1.65, marginTop: 28 };
const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 0.98, letterSpacing: '-0.04em', textTransform: 'uppercase', margin: '0 0 24px' };
const lead: React.CSSProperties = { color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem,1.7vw,1.24rem)', lineHeight: 1.7, fontWeight: 600, marginTop: 0 };
const bodyCopy: React.CSSProperties = { color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 };
const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)', gap: 'clamp(2.5rem,7vw,7rem)', alignItems: 'start' };
const platformGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, marginTop: 34 };
const platformCard: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', background: '#090909', padding: 'clamp(1.4rem,3vw,2rem)', minHeight: 360 };
const platformMark: React.CSSProperties = { fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(2rem,4vw,3.4rem)', textTransform: 'uppercase', margin: '22px 0 12px' };
const platformDescriptor: React.CSSProperties = { color: 'rgba(255,255,255,0.48)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.11em', textAlign: 'right' };
const numberStyle: React.CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em' };
const familyRow: React.CSSProperties = { padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.78)', fontWeight: 600 };
const requirementRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: '48px 1fr', gap: 16, padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.78)' };
const specRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: '38px 1fr', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.68)', fontSize: '0.9rem' };
const primaryButton: React.CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', padding: '0.9rem 1.4rem', textTransform: 'uppercase' };
const secondaryButton: React.CSSProperties = { display: 'inline-block', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', padding: '0.9rem 1.4rem', textTransform: 'uppercase' };
