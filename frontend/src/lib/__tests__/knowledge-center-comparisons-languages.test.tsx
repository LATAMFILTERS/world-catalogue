import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { getComparisonBySlug } from '../knowledge-center-data';
import { TRANSLATED_COMPARISON_SLUGS } from '../knowledge-center-data/i18n/titles';
import { translatedComparison } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import ComparisonContent from '../../app/knowledge-center/comparisons/[slug]/ComparisonContent';
import ComparisonApplyCta from '../../app/knowledge-center/comparisons/[slug]/ComparisonApplyCta';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/comparisons/iso4406-vs-nas1638/' }));
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

describe('Knowledge Center comparison pages in Spanish and Portuguese', () => {
  for (const slug of TRANSLATED_COMPARISON_SLUGS) {
    for (const lang of ['es', 'pt'] as const) {
      it(`${lang}/${slug} keeps the English structure, identifiers and every number`, () => {
        const en = getComparisonBySlug(slug)!;
        const tr = translatedComparison(slug, lang);
        const problems: string[] = [];
        compare(en, tr, slug, problems);
        expect(problems).toEqual([]);
        for (const id of ['id', 'slug', 'category', 'governingStandards', 'relatedStandards', 'relatedTechnologies', 'relatedSystems', 'relatedTerms', 'relatedArticles', 'revisionHistory'] as const) expect(tr[id]).toEqual(en[id]);
        expect(tr.engineeringObjective).not.toBe(en.engineeringObjective);
      });
    }
    it(`${slug} is a published /es/ and /pt/ route`, () => expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/comparisons/${slug}`));
  }

  it('renders the Spanish comparison page without English interface labels', () => {
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><ComparisonContent comparison={translatedComparison('iso4406-vs-nas1638', 'es')} /><ComparisonApplyCta /></I18nextProvider>);
    const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]*>/g, ' ');
    for (const spanish of ['NORMAS APLICABLES', 'VENTAJAS', 'LIMITACIONES', 'MATRIZ DE COMPARACIÓN DE INGENIERÍA', 'CUÁNDO USAR A', 'CUÁNDO NO USARLO', 'SIGUIENTE PASO DE APLICACIÓN']) expect(text).toContain(spanish);
    for (const label of ['GOVERNING STANDARDS', 'ADVANTAGES', 'LIMITATIONS', 'WHEN TO USE', 'WHEN NOT TO USE', 'ENGINEERING IMPLICATIONS', 'RELATED KNOWLEDGE', 'ALL COMPARISONS', 'APPLICATION NEXT STEP', 'Related Engineering Content', 'BFS GRAPH']) expect(text).not.toContain(label);
  });
});
