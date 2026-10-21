import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import IndustrialProcessPage from '../../app/industrial-process/page';
import PrivacyPage from '../../app/legal/privacy/page';
import { IndustrialProcessPlatformStablePage } from '../../components/IndustrialProcessPlatformStablePage';
import { INDUSTRIAL_PROCESS_PLATFORMS } from '../industrial-process-architecture';
import ClientNav from '../../app/knowledge-center/ClientNav';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/industrial-process/' }));

const render = (page: React.ReactNode, lang: 'en' | 'es' | 'pt') => renderToStaticMarkup(<I18nextProvider i18n={lang === 'en' ? i18n : localeInstances[lang]}>{page}</I18nextProvider>);
const blocks = (html: string) => [...html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').matchAll(/<(?:p|h[1-3]|li)\b[^>]*>([\s\S]*?)<\/(?:p|h[1-3]|li)>/g)].map(m => m[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/<!--.*?-->/g,'').replace(/\s+/g,' ').trim());

describe('Audited public pages translate complete content blocks', () => {
  const pages = [['industrial-process', <IndustrialProcessPage key="industrial-process" />], ['privacy', <PrivacyPage key="privacy" />], ...INDUSTRIAL_PROCESS_PLATFORMS.map(p => [p.slug, <IndustrialProcessPlatformStablePage key={p.slug} platform={p} />])] as const;
  for (const [name, page] of pages) {
    const english = blocks(render(page, 'en'));
    for (const lang of ['es','pt'] as const) it(name + ' / ' + lang + ' has no untranslated English paragraphs or headings', () => {
      const html = render(page,lang);
      const leaks = blocks(html).filter(t => t.length > 20 && (t.match(/[A-Za-z]+/g)||[]).length >= 4 && english.includes(t));
      expect([...new Set(leaks)]).toEqual([]);
      expect(html).not.toMatch(/â†|â€|reviewedCopy\.copy/);
      expect(html).not.toContain('>EXPLORE TECHNOLOGIES<');
      expect(html).not.toContain('>Depth Filtration<');
      if (name === 'privacy') {
        expect((html.match(/<h2\b/g)||[]).length).toBe(17);
        for (const unchanged of ['info@elimfilters.com','Kleo Technology LLC','13','Microsoft 365','Google Analytics 4','PostHog','Microsoft Clarity']) expect(html).toContain(unchanged);
      }
    });
  }
  for (const lang of ['es','pt'] as const) it('Knowledge Center navigation / '+lang, () => {
    const html=render(<ClientNav />,lang);
    expect(html).toContain(lang==='es'?'Ingeniería':'Engenharia');
    for(const english of ['>Overview<','>Engineering<','>Standards<','>Reference<'])expect(html).not.toContain(english);
  });
});
