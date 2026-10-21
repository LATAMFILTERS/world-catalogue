import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import KnowledgeCenterPage from '../../app/knowledge-center/page';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/knowledge-center/' }));

describe('Knowledge Center public copy follows the selected language', () => {
  for (const lang of ['en', 'es', 'pt'] as const) {
    it(lang + ' translates the hero, data cards, decisions and links without changing technical counts', () => {
      const instance = lang === 'en' ? i18n : localeInstances[lang];
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><KnowledgeCenterPage /></I18nextProvider>);
      const text = html.replace(/<[^>]*>/g, '');
      for (const count of ['12,192', '1,044,939', '37,751', '123,357', '282,252', '423']) expect(text).toContain(count);
      expect(text).not.toMatch(/â†|â€|reviewedCopy\.copy/);
      expect(html).toContain('https://part-search.elimfilters.com');
      expect(html).toContain('mailto:applications@elimfilters.com');
      if (lang !== 'en') {
        for (const english of ['Engineering knowledge for better asset decisions.', 'Primary catalog products', 'Choose the shortest technical path.', 'OPEN REFERENCE', 'Define the mechanism', 'Use Part Search when the application is known.']) expect(text).not.toContain(english);
        expect(text).toContain(lang === 'es' ? 'Conocimiento de ingeniería para decidir mejor' : 'Conhecimento de engenharia para melhores decisões');
        expect(text).toContain(lang === 'es' ? 'Modelos de equipos' : 'Modelos de equipamentos');
      } else expect(text).toContain('Engineering knowledge for better asset decisions.');
    });
  }
});
