'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

export default function WhoWeArePage() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  const copy = isSpanish ? {
    heroTitle: 'Quiénes Somos',
    heroLead: 'Desde 2015, ELIMFILTERS® es la marca de filtración industrial de Kleo Technology LLC, con sede legal en Frisco, Texas — organizada alrededor de la protección del activo, no del reemplazo de filtros, una distinción que define desde la arquitectura de producto hasta la estructura ejecutiva.',
    profileEyebrow: 'PERFIL DE LA EMPRESA',
    profileTitle: 'Una marca construida alrededor de la protección del activo, no del reemplazo de filtros.',
    profileBody: 'Fundada en 2015, ELIMFILTERS® es la marca de filtración industrial de Kleo Technology LLC, con sede legal en Frisco, Texas. La compañía opera un modelo comercial distributor-first, con capacidad coordinada para cuentas estratégicas, y organiza su plataforma técnica alrededor de cinco sistemas de protección en lugar de un catálogo plano de piezas: aire de motor y cabina, combustible, lubricación, circuitos hidráulicos y de enfriamiento, cada uno atendido por una tecnología propia diseñada específicamente para ese dominio.',
    builtEyebrow: 'CÓMO ESTAMOS CONSTRUIDOS',
    builtTitle: 'Una Chief Executive Office humana, junto con agentes ejecutivos de IA especializados.',
    builtBody: 'El Founder & CEO, Víctor Abreu, mantiene la autoridad ejecutiva final, y la Chief Executive Office conserva la responsabilidad institucional sobre la estructura de la compañía y sus decisiones materiales. La ejecución diaria por dominio —operaciones, producto y tecnología, mercados comerciales, finanzas y riesgo, estrategia e inteligencia— la llevan cinco agentes ejecutivos de IA especializados, bajo autoridad delegada, responsabilidad formal y escalamiento humano para decisiones estratégicas o irreversibles.',
    builtLink: 'Conocer al equipo de liderazgo →',
    purposeEyebrow: 'PROTECCIÓN AMBIENTAL',
    purposeTitle: 'El control de contaminación es inseparable del impacto ambiental.',
    purposeBody: 'Cada falla que la filtración disciplinada previene es también una falla que el ambiente no tiene que absorber: menos fluidos contaminados que desechar, menos componentes desgastados prematuramente que fabricar para reemplazar lo que debió durar más, y menos combustible o energía consumidos por un equipo que trabaja más de lo necesario porque no está operando limpio. Proteger el activo y proteger el entorno que lo rodea son, en la práctica, la misma disciplina de ingeniería.',
  } : {
    heroTitle: 'Who We Are',
    heroLead: 'Since 2015, ELIMFILTERS® has been the industrial filtration brand of Kleo Technology LLC, legally headquartered in Frisco, Texas — organized around asset protection rather than filter replacement, a distinction that shapes everything from product architecture to executive structure.',
    profileEyebrow: 'COMPANY PROFILE',
    profileTitle: 'A brand built around asset protection, not filter replacement.',
    profileBody: 'Founded in 2015, ELIMFILTERS® is the industrial filtration brand of Kleo Technology LLC, legally headquartered in Frisco, Texas. The company operates a distributor-first commercial model with coordinated capability for strategic accounts, and organizes its technical platform around five protection systems rather than a flat parts catalog: engine air and cabin air, fuel, lubrication, hydraulic, and cooling-system circuits, each served by a purpose-built technology of its own.',
    builtEyebrow: 'HOW WE’RE BUILT',
    builtTitle: 'A human Chief Executive Office, paired with specialized executive AI agents.',
    builtBody: 'Founder & CEO Víctor Abreu holds final executive authority, and the Chief Executive Office retains institutional accountability for the company’s structure and material decisions. Day-to-day domain execution — operations, product and technology, commercial markets, finance and risk, strategy and intelligence — is carried by five specialized executive AI agents operating under delegated authority, formal accountability, and human escalation for strategic or irreversible decisions.',
    builtLink: 'Meet the leadership team →',
    purposeEyebrow: 'ENVIRONMENTAL PROTECTION',
    purposeTitle: 'Contamination control is inseparable from environmental impact.',
    purposeBody: 'Every failure that disciplined filtration prevents is also a failure the environment doesn’t have to absorb: fewer contaminated fluids to dispose of, fewer prematurely worn components manufactured to replace what should have lasted, and less fuel or energy burned by equipment working harder than it should because it isn’t running clean. Protecting the asset and protecting the environment around it are, in practice, the same engineering discipline.',
  };

  return (
    <main id="main-content" style={main}>
      <PageHeader breadcrumbs={[{ label: 'About', href: '/about' }]} currentPage={isSpanish ? 'Quiénes Somos' : 'Who We Are'} />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />
        <div style={wrap}>
          <p style={eyebrow}>ELIMFILTERS · {isSpanish ? 'QUIÉNES SOMOS' : 'WHO WE ARE'}</p>
          <h1 style={heroTitle}>{copy.heroTitle}</h1>
          <p style={heroLead}>{copy.heroLead}</p>
        </div>
      </section>

      <section style={lightSection}>
        <div style={identityGrid}>
          <div>
            <p style={darkEyebrow}>{copy.profileEyebrow}</p>
            <h2 style={darkTitle}>{copy.profileTitle}</h2>
            <p style={darkBody}>{copy.profileBody}</p>
          </div>
          <div style={identityPhotoShell}>
            <img src="/images/planta_converted.avif" alt="ELIMFILTERS manufacturing facility" style={portraitImage} />
          </div>
        </div>
      </section>

      <section style={darkSectionDivided}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.builtEyebrow}</p>
          <h2 style={sectionTitle}>{copy.builtTitle}</h2>
          <p style={sectionLead}>{copy.builtBody}</p>
          <Link href="/about/leadership" style={textLink}>{copy.builtLink}</Link>
        </div>
      </section>

      <section style={closingSection}>
        <div style={wrap}>
          <p style={eyebrow}>{copy.purposeEyebrow}</p>
          <h2 style={closingTitle}>{copy.purposeTitle}</h2>
          <p style={closingBody}>{copy.purposeBody}</p>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };
const heroSection: CSSProperties = { minHeight: '76vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem,10vw,9rem) clamp(1.25rem,6vw,6rem)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'url(/images/grupo-filters.avif)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: .38 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.48) 58%,rgba(0,0,0,.2)),radial-gradient(circle at 80% 15%,rgba(255,241,45,.14),transparent 32%)' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', margin: '0 0 1rem', textTransform: 'uppercase', position: 'relative', zIndex: 2 };
const darkEyebrow: CSSProperties = { ...eyebrow, color: '#6c6100' };
const heroTitle: CSSProperties = { position: 'relative', zIndex: 2, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .92, fontSize: 'clamp(3.2rem,7vw,7rem)', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { position: 'relative', zIndex: 2, marginTop: '1.5rem', maxWidth: '900px', color: 'rgba(255,255,255,.82)', fontSize: 'clamp(1rem,1.5vw,1.25rem)', lineHeight: 1.75, fontWeight: 550 };
const lightSection: CSSProperties = { background: '#050505', color: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)' };
const identityGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' };
const identityPhotoShell: CSSProperties = { aspectRatio: '4 / 3', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.1)' };
const portraitImage: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const darkTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '850px', margin: '0 0 1.5rem', textTransform: 'uppercase' };
const darkBody: CSSProperties = { maxWidth: '880px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '1.05rem' };
const sectionTitle: CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 1, letterSpacing: '-.035em', maxWidth: '950px', margin: '0 0 1rem', textTransform: 'uppercase' };
const sectionLead: CSSProperties = { color: 'rgba(255,255,255,.68)', lineHeight: 1.75, maxWidth: '900px', fontSize: '1.03rem' };
const darkSectionDivided: CSSProperties = { background: '#050505', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,255,255,.06)' };
const textLink: CSSProperties = { display: 'inline-block', marginTop: '1.5rem', color: '#FFF12D', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.05em' };
const closingSection: CSSProperties = { background: '#000', padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,241,45,.16)' };
const closingTitle: CSSProperties = { ...sectionTitle, maxWidth: '900px' };
const closingBody: CSSProperties = { ...sectionLead, maxWidth: '850px' };
