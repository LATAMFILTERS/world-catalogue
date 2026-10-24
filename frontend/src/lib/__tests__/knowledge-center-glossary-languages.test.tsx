import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { TERMINOLOGY_REGISTRY, slugToTermId } from '../knowledge-center';
import { TRANSLATED_GLOSSARY_SLUGS, termTitle } from '../knowledge-center-data/i18n/titles';
import { translatedTerm } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import GlossaryTermContent from '../../app/knowledge-center/glossary/[term]/GlossaryTermContent';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/glossary/beta-ratio/' }));
vi.mock('motion/react', () => {
  const tag = (name: string) => React.forwardRef<HTMLElement, Record<string, unknown>>(function Motion({ initial, animate, transition, whileHover, whileInView, viewport, ...props }, ref) {
    void initial; void animate; void transition; void whileHover; void whileInView; void viewport;
    return React.createElement(name, { ...props, ref });
  });
  return { motion: new Proxy({}, { get: (_target, name: string) => tag(name) }) };
});

const numbers = (text: string) => (text.match(/\d+(?:[.,]\d+)*/g) ?? []).sort().join(' ');

describe('Knowledge Center glossary terms in Spanish and Portuguese', () => {
  for (const slug of TRANSLATED_GLOSSARY_SLUGS) {
    for (const lang of ['es', 'pt'] as const) {
      it(`${lang}/${slug} keeps identifiers, relations and every number`, () => {
        const en = TERMINOLOGY_REGISTRY[slugToTermId(slug)];
        const tr = translatedTerm(slug, lang);
        for (const id of ['id', 'category', 'abbreviations', 'applicableStandards', 'relatedTerms', 'relatedTechnologies', 'relatedSystems', 'relatedArticles', 'version', 'status', 'lastReviewed'] as const) expect(tr[id]).toEqual(en[id]);
        expect(tr.aliases).toHaveLength(en.aliases.length);
        for (const field of ['term', 'definition', 'engineeringContext'] as const) {
          expect(tr[field].trim()).not.toBe('');
          expect(numbers(tr[field])).toBe(numbers(en[field]));
        }
        expect(tr.definition).not.toBe(en.definition);
        expect(termTitle(slug, lang, en.term)).toBe(tr.term);
      });
    }
    it(`${slug} is a published /es/ and /pt/ route`, () => expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/glossary/${slug}`));
  }

  it('renders the Spanish term page without English interface labels', () => {
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><GlossaryTermContent entry={translatedTerm('beta-ratio', 'es')} slug="beta-ratio" /></I18nextProvider>);
    const text = html.replace(/<[^>]*>/g, ' ');
    expect(text).toContain('Relación Beta');
    for (const spanish of ['Definición canónica', 'Contexto de ingeniería', 'Términos relacionados', 'Metadatos de gobernanza KC-00']) expect(text).toContain(spanish);
    for (const label of ['Canonical Definition', 'Engineering Context', 'Related Terms', 'Applicable Standards', 'Knowledge Center Articles', 'Last Reviewed', 'Absolute Efficiency']) expect(text).not.toContain(label);
  });
});
