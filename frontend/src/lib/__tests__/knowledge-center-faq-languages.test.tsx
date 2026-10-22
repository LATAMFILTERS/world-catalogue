import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { getFAQRegistry } from '../faq-registry';
import { translatedFAQ } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import FAQHub from '../../app/knowledge-center/faq/FAQHub';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/faq/' }));

// Every number in a sentence (codes, limits, classes, ratios) must survive translation unchanged.
const numbers = (text: string) => (text.match(/\d+(?:[.,]\d+)*/g) ?? []).sort().join(' ');

describe('Knowledge Center FAQ in Spanish and Portuguese', () => {
  const registry = getFAQRegistry();

  for (const lang of ['es', 'pt'] as const) {
    it(`${lang}: every registry question is translated with the same numbers`, () => {
      const tr = translatedFAQ(lang);
      const problems: string[] = [];
      for (const entry of registry) {
        const t = tr.questions[entry.id];
        if (!t?.question?.trim() || !t?.answer?.trim()) { problems.push(`${entry.id}: missing`); continue; }
        if (t.question === entry.question) problems.push(`${entry.id}: question not translated`);
        for (const field of ['question', 'answer'] as const) {
          if (numbers(entry[field]) !== numbers(t[field])) problems.push(`${entry.id}.${field}: ${numbers(entry[field])} ≠ ${numbers(t[field])}`);
        }
      }
      for (const category of new Set(registry.map((e) => e.category))) if (!tr.categories[category]) problems.push(`category ${category}`);
      expect(problems).toEqual([]);
      expect(Object.keys(tr.questions).sort()).toEqual(registry.map((e) => e.id).sort());
    });
  }

  it('is a published /es/ and /pt/ route', () => expect(LOCALIZED_ROUTES).toContain('/knowledge-center/faq'));

  it('renders the Spanish FAQ without English interface labels', () => {
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><FAQHub lang="es" /></I18nextProvider>);
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ');
    for (const spanish of ['Preguntas técnicas frecuentes', 'Centro de Conocimiento', 'Sistemas de protección', 'Contexto técnico relacionado']) expect(text).toContain(spanish);
    for (const label of ['Technical Frequently Asked Questions', 'Related technical context', 'Protection systems', 'How this page is governed', 'governed questions']) expect(text).not.toContain(label);
    expect(html).toContain('href="/es/knowledge-center/"');
  });
});
