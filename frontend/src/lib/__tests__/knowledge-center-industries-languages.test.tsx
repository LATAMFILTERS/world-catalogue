import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { KC_INDUSTRIES, KC_INDUSTRY_DETAILS } from '../knowledge-center-data';
import { TRANSLATED_INDUSTRY_SLUGS } from '../knowledge-center-data/i18n/titles';
import { translatedIndustry } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import IndustryContent from '../../app/knowledge-center/industries/[slug]/IndustryContent';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/industries/mining/' }));
vi.mock('motion/react', () => {
  const tag = (name: string) => React.forwardRef<HTMLElement, Record<string, unknown>>(function Motion({ initial, animate, transition, whileHover, whileInView, viewport, ...props }, ref) {
    void initial; void animate; void transition; void whileHover; void whileInView; void viewport;
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

describe('Knowledge Center industry pages in Spanish and Portuguese', () => {
  for (const slug of TRANSLATED_INDUSTRY_SLUGS) {
    for (const lang of ['es', 'pt'] as const) {
      it(`${lang}/${slug} keeps the English structure, identifiers and every number`, () => {
        const en = { industry: KC_INDUSTRIES.find((i) => i.slug === slug)!, detail: KC_INDUSTRY_DETAILS[slug] ?? null };
        const tr = translatedIndustry(slug, lang);
        const problems: string[] = [];
        compare(en, tr, slug, problems);
        expect(problems).toEqual([]);
        for (const id of ['slug', 'icon', 'dust'] as const) expect(tr.industry[id]).toEqual(en.industry[id]);
        for (const id of ['technologies', 'standards', 'systems'] as const) expect(tr.detail?.[id]).toEqual(en.detail?.[id]);
        expect(tr.industry.description).not.toBe(en.industry.description);
      });
    }
    it(`${slug} is a published /es/ and /pt/ route`, () => expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/industries/${slug}`));
  }

  it('renders the Spanish industry page without English interface labels', () => {
    const { industry, detail } = translatedIndustry('mining', 'es');
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><IndustryContent industry={industry} detail={detail} /></I18nextProvider>);
    const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]*>/g, ' ');
    for (const spanish of ['Minería', 'EXPOSICIÓN EXTREMA A LA CONTAMINACIÓN', 'Principales riesgos de contaminación', 'OTRAS INDUSTRIAS', 'Protección hidráulica', 'Ver la guía completa de sistemas de filtración para Minería']) expect(text).toContain(spanish);
    for (const label of ['CONTAMINATION EXPOSURE', 'Primary Contamination Risks', 'Service Interval Guidance', 'OTHER INDUSTRIES', 'PROTECTION SYSTEMS', 'Hydraulic Protection', 'See the full']) expect(text).not.toContain(label);
  });
});
