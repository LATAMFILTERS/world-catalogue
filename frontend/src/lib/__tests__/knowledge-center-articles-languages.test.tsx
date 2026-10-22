import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { ENGINEERING_ARTICLES } from '../knowledge-center-data';
import { TRANSLATED_ARTICLE_SLUGS } from '../knowledge-center-data/i18n/titles';
import { translatedArticle } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import ArticleContent from '../../app/knowledge-center/engineering/[topic]/ArticleContent';
import ArticleApplyCta from '../../app/knowledge-center/engineering/[topic]/ArticleApplyCta';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/engineering/total-cost-of-ownership/' }));
vi.mock('motion/react', () => {
  const tag = (name: string) => React.forwardRef<HTMLElement, Record<string, unknown>>(function Motion({ initial, animate, transition, whileHover, ...props }, ref) {
    void initial; void animate; void transition; void whileHover;
    return React.createElement(name, { ...props, ref });
  });
  return { motion: new Proxy({}, { get: (_target, name: string) => tag(name) }) };
});

const english = (slug: string) => ENGINEERING_ARTICLES.find((article) => article.slug === slug)!;
// Every number in a sentence (codes, limits, prices, ratios) must survive translation unchanged.
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

describe('Knowledge Center engineering articles in Spanish and Portuguese', () => {
  for (const slug of TRANSLATED_ARTICLE_SLUGS) {
    for (const lang of ['es', 'pt'] as const) {
      it(`${lang}/${slug} keeps the English structure, identifiers and every number`, () => {
        const en = english(slug);
        const tr = translatedArticle(slug, lang);
        const problems: string[] = [];
        compare(en, tr, slug, problems);
        expect(problems).toEqual([]);
        for (const id of ['slug', 'relatedStandards', 'relatedTechnologies', 'relatedSystems'] as const) expect(tr[id]).toEqual(en[id]);
        expect(tr.title).not.toBe(en.title);
        expect(tr.sections.map((s) => s.heading)).not.toEqual(en.sections.map((s) => s.heading));
      });
    }
    it(`${slug} is a published /es/ and /pt/ route`, () => expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/engineering/${slug}`));
  }

  it('renders the Spanish article page without English interface labels', () => {
    const article = translatedArticle('total-cost-of-ownership', 'es');
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><ArticleContent article={article} /><ArticleApplyCta /></I18nextProvider>);
    const text = html.replace(/<[^>]*>/g, ' ');
    expect(text).toContain('Costo total de propiedad');
    expect(text).toContain('La regla del 1-5% del costo del filtro');
    for (const spanish of ['Centro de Conocimiento', 'REFERENCIAS DE INGENIERÍA', 'PREGUNTAS FRECUENTES', 'CITAR ESTA PÁGINA', 'SOLICITAR SOPORTE DE APLICACIONES']) expect(text).toContain(spanish);
    for (const label of ['RELATED ARTICLES', 'ENGINEERING REFERENCES', 'FREQUENTLY ASKED QUESTIONS', 'CITE THIS PAGE', 'REQUEST APPLICATION SUPPORT', 'APPLY THE ENGINEERING REFERENCE', 'REVIEWED BY']) expect(text).not.toContain(label);
  });
});
