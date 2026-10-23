import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { KC_TECHNOLOGIES } from '../knowledge-center-data';
import { TRANSLATED_TECHNOLOGY_SLUGS, technologyText } from '../knowledge-center-data/i18n/titles';
import { translatedSystem, translatedTechnology } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import TechContent from '../../app/knowledge-center/technologies/[slug]/TechContent';
import SystemContent from '../../app/knowledge-center/systems/[slug]/SystemContent';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/technologies/nanoforce/' }));
vi.mock('motion/react', () => {
  const tag = (name: string) => React.forwardRef<HTMLElement, Record<string, unknown>>(function Motion({ initial, animate, transition, whileHover, ...props }, ref) {
    void initial; void animate; void transition; void whileHover;
    return React.createElement(name, { ...props, ref });
  });
  return { motion: new Proxy({}, { get: (_target, name: string) => tag(name) }) };
});

const numbers = (text: string) => (text.match(/\d+(?:[.,]\d+)*/g) ?? []).sort().join(' ');

function compare(en: unknown, tr: unknown, path: string, problems: string[]) {
  if (typeof en === 'string') {
    if (typeof tr !== 'string' || (en.trim() && !tr.trim())) problems.push(`${path}: missing text`);
    else if (numbers(en) !== numbers(tr)) problems.push(`${path}: numbers ${numbers(en)} ≠ ${numbers(tr)}`);
  } else if (Array.isArray(en)) {
    if (!Array.isArray(tr) || tr.length !== en.length) problems.push(`${path}: ${Array.isArray(tr) ? tr.length : 'no'} items, expected ${en.length}`);
    else en.forEach((item, i) => compare(item, tr[i], `${path}[${i}]`, problems));
  } else if (en && typeof en === 'object') {
    const keys = Object.keys(en);
    if (!tr || typeof tr !== 'object' || Object.keys(tr).sort().join() !== [...keys].sort().join()) problems.push(`${path}: different fields`);
    else for (const key of keys) compare((en as Record<string, unknown>)[key], (tr as Record<string, unknown>)[key], `${path}.${key}`, problems);
  } else if (en !== tr) problems.push(`${path}: ${String(en)} ≠ ${String(tr)}`);
}

describe('Knowledge Center technology pages in Spanish and Portuguese', () => {
  it('covers every published technology', () => {
    expect([...TRANSLATED_TECHNOLOGY_SLUGS].sort()).toEqual(KC_TECHNOLOGIES.map((t) => t.slug).sort());
  });

  for (const slug of TRANSLATED_TECHNOLOGY_SLUGS) {
    for (const lang of ['es', 'pt'] as const) {
      it(`${lang}/${slug} keeps the English structure, identifiers and every number`, () => {
        const en = KC_TECHNOLOGIES.find((t) => t.slug === slug)!;
        const tr = translatedTechnology(slug, lang);
        const problems: string[] = [];
        compare(en, tr, slug, problems);
        expect(problems).toEqual([]);
        for (const id of ['slug', 'name', 'standards', 'relatedSystems', 'relatedIndustries', 'worksWith', 'image', 'howItWorks'] as const) expect(tr[id]).toEqual(en[id]);
        expect(tr.tagline).not.toBe(en.tagline);
        expect(technologyText(slug, 'tagline', lang, en.tagline)).toBe(tr.tagline);
        expect(technologyText(slug, 'domain', lang, en.domain)).toBe(tr.domain);
      });
    }
    it(`${slug} is a published /es/ and /pt/ route`, () => expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/technologies/${slug}`));
  }

  it('renders the Spanish technology page without English interface labels', () => {
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><TechContent tech={translatedTechnology('nanoforce', 'es')} /></I18nextProvider>);
    const text = html.replace(/<[^>]*>/g, ' ');
    expect(text).toContain('Arquitectura de filtración hidráulica');
    for (const spanish of ['Centro de Conocimiento', 'Modos de contaminación controlados', 'Selección para la aplicación', 'NORMAS APLICABLES', 'Protección hidráulica']) expect(text).toContain(spanish);
    for (const label of ['Contamination Modes Controlled', 'Application Selection', 'Evidence Boundary', 'GOVERNING STANDARDS', 'ALL TECHNOLOGIES', 'VIEW SYSTEM', 'Reviewed by']) expect(text).not.toContain(label);
  });

  it('shows Spanish technology taglines on the Spanish system page', () => {
    const { system, detail } = translatedSystem('hydraulic-protection', 'es');
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><SystemContent system={system} detail={detail} /></I18nextProvider>);
    expect(html).toContain('Arquitectura de filtración hidráulica');
    expect(html).not.toContain(KC_TECHNOLOGIES.find((t) => t.slug === 'nanoforce')!.tagline);
  });
});
