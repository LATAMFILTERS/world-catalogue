'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KCTechnology } from '@/lib/knowledge-center-data';
import { siteLangFromTag, type SiteLang } from '@/lib/language-preference';

// How It Works: the technology explained in the visitor's site language, tied to its interactive figures
// (self-contained pages opened directly, never framed). Tabs let the reader switch language.

const LANG_LABELS: Record<SiteLang, string> = { en: 'English', es: 'Español', pt: 'Português' };

const UI: Record<SiteLang, { eyebrow: string; title: (name: string) => string; open: string; reading: string; components: string; formats: string; service: string; diagnosis: string; language: string }> = {
  en: { eyebrow: 'HOW IT WORKS', title: (n) => `How ${n} Works`, open: 'OPEN INTERACTIVE FIGURE →', reading: 'Reading the figure', components: 'What each component does', formats: 'Spin-on and cartridge formats', service: 'Service sequence', diagnosis: 'Diagnosis in the circuit', language: 'Language' },
  es: { eyebrow: 'CÓMO FUNCIONA', title: (n) => `Cómo funciona ${n}`, open: 'ABRIR FIGURA INTERACTIVA →', reading: 'Cómo leer la figura', components: 'Qué hace cada componente', formats: 'Formatos spin-on y cartucho', service: 'Secuencia de servicio', diagnosis: 'Diagnóstico en el circuito', language: 'Idioma' },
  pt: { eyebrow: 'COMO FUNCIONA', title: (n) => `Como funciona ${n}`, open: 'ABRIR FIGURA INTERATIVA →', reading: 'Como ler a figura', components: 'O que cada componente faz', formats: 'Formatos spin-on e cartucho', service: 'Sequência de manutenção', diagnosis: 'Diagnóstico no circuito', language: 'Idioma' },
};

const bodyText = { fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.66)', marginBottom: '1rem' } as const;
const subHeading = { fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.05rem', color: '#fff', marginBottom: '0.75rem', marginTop: '1.75rem' } as const;
const numbered = { paddingLeft: '1.5rem', margin: 0, listStyle: 'decimal', color: '#FFF12D' } as const;
const item = { ...bodyText, marginBottom: '0.5rem', display: 'list-item' } as const;
const strong = { color: '#fff', fontWeight: 600 } as const;
const mono = { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem' } as const;

const pageName = (href: string) => href.replace(/^.*\//, '').replace(/\.html$/, '');

export default function HowItWorks({ tech }: { tech: KCTechnology }) {
  const { i18n } = useTranslation();
  const siteLang = siteLangFromTag(i18n.resolvedLanguage || i18n.language);
  const [chosen, setLang] = useState<SiteLang | null>(null);
  const lang = chosen ?? siteLang;

  if (!tech.figures?.length) return null;
  const text = tech.howItWorks?.[lang];
  const ui = UI[text ? lang : 'en'];

  return (
    <section aria-labelledby="how-it-works" lang={text ? lang : 'en'} style={{ marginBottom: '3rem' }}>
      <p style={{ ...mono, letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.6rem' }}>{ui.eyebrow}</p>
      <h2 id="how-it-works" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>{ui.title(tech.name)}</h2>
      {tech.howItWorks && (
        <div role="group" aria-label={ui.language} style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {(Object.keys(LANG_LABELS) as SiteLang[]).map((l) => (
            <button key={l} type="button" lang={l} aria-pressed={l === lang} onClick={() => setLang(l)} style={{ ...mono, fontSize: '0.65rem', padding: '0.35rem 0.7rem', cursor: 'pointer', background: l === lang ? '#FFF12D' : 'transparent', color: l === lang ? '#000' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,241,45,0.4)' }}>{LANG_LABELS[l]}</button>
          ))}
        </div>
      )}
      {text?.overview.map((paragraph, i) => <p key={i} style={bodyText}>{paragraph}</p>)}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {tech.figures.map((figure) => {
          const local = text?.figures[pageName(figure.href)];
          const pages = [{ lang: 'en', label: LANG_LABELS.en, href: figure.href }, ...(figure.translations ?? [])];
          const main = pages.find((p) => p.lang === lang) ?? pages[0];
          const title = local?.title ?? figure.title;
          return (
            <div key={figure.href} style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <a href={main.href} hrefLang={main.lang} style={{ textDecoration: 'none', display: 'block' }}>
                <img src={figure.preview} alt={title} loading="lazy" width={993} height={956} style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ padding: '0.9rem 1rem 0' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '0.35rem' }}>{title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>{local?.caption ?? figure.caption}</p>
                  <p style={{ ...mono, color: '#FFF12D' }}>{ui.open}</p>
                </div>
              </a>
              {pages.length > 1 && (
                <p style={{ ...mono, color: 'rgba(255,255,255,0.45)', padding: '0.4rem 1rem 0.9rem', margin: 0 }}>
                  {pages.filter((p) => p !== main).map((p, i) => (
                    <span key={p.href}>{i > 0 && ' · '}<a href={p.href} hrefLang={p.lang} lang={p.lang} style={{ color: 'rgba(255,241,45,0.75)' }}>{p.label}</a></span>
                  ))}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {text && (
        <>
          {tech.figures.map((figure) => {
            const local = text.figures[pageName(figure.href)];
            return local && (
              <div key={figure.href}>
                <h3 style={subHeading}>{ui.reading}: {local.title}</h3>
                <ol style={numbered}>
                  {local.steps.map((step, i) => <li key={i} style={item}><strong style={strong}>{step.part}.</strong> {step.text}</li>)}
                </ol>
              </div>
            );
          })}
          <h3 style={subHeading}>{ui.components}</h3>
          <dl style={{ margin: 0 }}>
            {text.components.map((c) => (
              <div key={c.name} style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <dt style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>{c.name}</dt>
                <dd style={{ ...bodyText, margin: 0 }}>{c.role}</dd>
              </div>
            ))}
          </dl>
          {text.formats && (
            <>
              <h3 style={subHeading}>{ui.formats}</h3>
              {text.formats.map((f) => <p key={f.name} style={bodyText}><strong style={strong}>{f.name}.</strong> {f.text}</p>)}
            </>
          )}
          <h3 style={subHeading}>{ui.service}</h3>
          <ol style={numbered}>
            {text.service.map((step, i) => <li key={i} style={item}>{step}</li>)}
          </ol>
          <h3 style={subHeading}>{ui.diagnosis}</h3>
          {text.diagnostics.map((d) => (
            <div key={d.symptom} style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', borderLeft: '2px solid rgba(255,241,45,0.4)', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: '#fff', margin: '0 0 0.25rem' }}>{d.symptom}</p>
              <p style={{ ...bodyText, margin: 0 }}>{d.check}</p>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
