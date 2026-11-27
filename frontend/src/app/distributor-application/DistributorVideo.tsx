'use client';

import { usePathname } from 'next/navigation';
import { localeFromPath } from '@/i18n-locales';

// "Why ELIMFILTERS" distributor film. Horizontal (16:9) on desktop, vertical (9:16) on phones.
// Each locale route plays its own language version.
const COPY = {
  en: {
    eyebrow: '// DISTRIBUTOR PROGRAM FILM',
    title: 'Why ELIMFILTERS',
    body: 'What it means to build the ELIMFILTERS business in your country: products, technical knowledge, technology and the tools to develop your own market.',
  },
  es: {
    eyebrow: '// VIDEO DEL PROGRAMA DE DISTRIBUIDORES',
    title: 'Por qué ELIMFILTERS',
    body: 'Lo que significa construir el negocio ELIMFILTERS en su país: productos, conocimiento técnico, tecnología y las herramientas para desarrollar su propio mercado.',
  },
  pt: {
    eyebrow: '// VÍDEO DO PROGRAMA DE DISTRIBUIDORES',
    title: 'Por que ELIMFILTERS',
    body: 'O que significa construir o negócio ELIMFILTERS no seu país: produtos, conhecimento técnico, tecnologia e as ferramentas para desenvolver o seu próprio mercado.',
  },
} as const;

const CSS = `
.dv-wide{display:block;width:100%;aspect-ratio:16/9;height:auto;background:#000;border:1px solid rgba(255,255,255,0.1)}
.dv-tall{display:none;width:100%;max-width:min(420px,calc(78vh*9/16));aspect-ratio:9/16;height:auto;margin:0 auto;background:#000;border:1px solid rgba(255,255,255,0.1)}
@media (max-width:767px){.dv-wide{display:none}.dv-tall{display:block}}
`;

export function DistributorVideo() {
  const lang = localeFromPath(usePathname()) ?? 'en';
  const c = COPY[lang];
  const src = (fmt: '16x9' | '9x16') => `/assets/distributor-video/why-elimfilters-${lang}-${fmt}`;

  return (
    <section id="distributor-video" aria-labelledby="distributor-video-title" style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 3rem)', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#000' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <p style={{ color: '#FFF12D', fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem', textTransform: 'uppercase' }}>{c.eyebrow}</p>
        <h2 id="distributor-video-title" style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: 'clamp(2rem, 4vw, 3.8rem)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.03em', margin: 0 }}>{c.title}</h2>
        <p style={{ maxWidth: '820px', color: 'rgba(255,255,255,0.72)', fontSize: '1.1rem', lineHeight: 1.7, fontWeight: 600, margin: '1.2rem 0 2.2rem' }}>{c.body}</p>
        <div>
          <video className="dv-wide" controls playsInline preload="metadata" poster={`${src('16x9')}.jpg`} aria-label={c.title}>
            <source src={`${src('16x9')}.mp4`} type="video/mp4" />
          </video>
          <video className="dv-tall" controls playsInline preload="none" poster={`${src('9x16')}.jpg`} aria-label={c.title}>
            <source src={`${src('9x16')}.mp4`} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
