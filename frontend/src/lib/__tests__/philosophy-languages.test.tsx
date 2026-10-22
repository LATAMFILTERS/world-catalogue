import React from 'react';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import OurPhilosophyPage from '../../app/about/philosophy/page';

vi.mock('next/navigation', () => ({ usePathname: () => '/about/philosophy/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));

describe('Philosophy approved doctrine and responsive presentation', () => {
  it('exempts the Philosophy hero from global forced first-section typography', () => {
    const css = readFileSync(new URL('../../app/globals.css', import.meta.url), 'utf8');
    expect(css).toContain('main:not(.leadership-page):not(.philosophy-page) > section:first-of-type h1');
    expect(css).not.toMatch(/(?<!:not\(\.philosophy-page\)) > section:first-of-type h1 \{/);
  });

  for (const lang of ['en', 'es', 'pt'] as const) {
    it(`${lang} renders six reviewed sections, seven principles, and a distinct technical hero`, () => {
      const instance = lang === 'en' ? i18n : localeInstances[lang];
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><OurPhilosophyPage /></I18nextProvider>);
      const visible = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
      expect(visible).toContain('class="philosophy-page');
      expect(visible).toContain('class="philosophy-hero-inner');
      expect(visible).toContain('banco-pruebas-filtros.png');
      expect(visible).not.toContain('grupo-filters.avif');
      expect(visible).not.toContain('air-filters-lab.avif');
      expect(visible).toContain('opacity:0.82');
      const pageSource = readFileSync(new URL('../../app/about/philosophy/page.tsx', import.meta.url), 'utf8');
      expect(pageSource).toContain('rgba(0,0,0,.38) 100%');
      expect(pageSource).toContain("textShadow:'0 1px 5px rgba(0,0,0,.70)'");
      expect((visible.match(/class="philosophy-statement(?:\s|")/g) || []).length).toBe(6);
      expect((visible.match(/class="philosophy-principle-card(?:\s|")/g) || []).length).toBe(7);
      expect((visible.match(/class="philosophy-statement-lead(?:\s|")/g) || []).length).toBe(6);
      for (const standard of ['ISO 16889', 'ISO 5011', 'ISO 4406']) expect(visible).toContain(standard);
      for (const technology of ['MACROCORE™', 'SYNTAPORE™', 'NANOFORCE™']) expect(visible).toContain(technology);
      expect(visible).not.toMatch(/70[–-]80%|bypass cero|zero.bypass|folgas comuns de 1[–-]5/gi);
      expect(visible).toContain(lang === 'es' ? 'Primero comprendemos el activo.' : lang === 'pt' ? 'Primeiro compreendemos o ativo.' : 'Understand the asset first.');
      expect(visible).toContain(lang === 'es' ? 'El filtro es el medio.' : lang === 'pt' ? 'O filtro é o meio.' : 'The filter is the means.');
      expect(visible).toContain(lang === 'es' ? '7 PRINCIPIOS RECTORES' : lang === 'pt' ? '7 PRINCÍPIOS ORIENTADORES' : '7 GUIDING PRINCIPLES');
    });
  }
});
