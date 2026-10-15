import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import NetworkHubPage from '../../app/about/who-we-are/network/page';
import FpsPage from '../../app/about/who-we-are/network/fps/page';
import ColsaisaPage from '../../app/about/who-we-are/network/colsaisa/page';
import TroyPage from '../../app/about/who-we-are/network/troy/page';
import MercofilterPage from '../../app/about/who-we-are/network/mercofilter/page';
import WhoWeArePage from '../../app/about/who-we-are/page';
import OurPhilosophyPage from '../../app/about/philosophy/page';

vi.mock('next/navigation', () => ({ usePathname: () => '/about/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));

describe('Corporate copy follows the selected language', () => {
  for (const lang of ['en', 'es', 'pt'] as const) {
    const instance = lang === 'en' ? i18n : localeInstances[lang];
    const render = (page: React.ReactNode) => renderToStaticMarkup(<I18nextProvider i18n={instance}>{page}</I18nextProvider>).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    it(lang + ' renders the company profile, navigation and image description', () => {
      const html = render(<WhoWeArePage />);
      expect(html).toContain(lang === 'pt' ? 'Quem Somos' : lang === 'es' ? 'Quiénes Somos' : 'Who We Are');
      expect(html).toContain(lang === 'pt' ? 'PERFIL DA EMPRESA' : lang === 'es' ? 'PERFIL DE LA EMPRESA' : 'COMPANY PROFILE');
      for (const original of ['2015', '2020', 'Frisco, Texas', 'Kleo Technology LLC', 'Víctor Abreu']) expect(html).toContain(original);
      expect(html).toContain('href="/distributor-application"');
      expect(html).toContain('href="/about/leadership"');
      if (lang === 'pt') {
        for (const original of ['WHO WE ARE', 'Who We Are', 'COMPANY PROFILE', 'GLOBAL EXPANSION', 'ENVIRONMENTAL PROTECTION', 'ELIMFILTERS manufacturing facility']) expect(html).not.toContain(original);
        expect(html).toContain('Instalações de fabricação da ELIMFILTERS');
        expect(html).toContain('PROTEÇÃO AMBIENTAL');
      }
    });
    it(lang + ' renders the network hub and all four partner profiles', () => {
      const html = render(<><NetworkHubPage /><FpsPage /><ColsaisaPage /><TroyPage /><MercofilterPage /></>);
      for (const name of ['FPS', 'COLSAISA', 'TROY', 'Mercofilter', 'SAISA', 'COBARCA', 'Gulf', 'ACDelco', 'Fuka', 'Yukkazo']) expect(html).toContain(name);
      for (const slug of ['fps', 'colsaisa', 'troy', 'mercofilter']) expect(html).toContain('href="/about/who-we-are/network/' + slug + '"');
      expect(html).toContain(lang === 'pt' ? 'Os parceiros por trás da expansão.' : lang === 'es' ? 'Los socios detrás de la expansión.' : 'The partners behind the expansion.');
      if (lang === 'pt') {
        for (const original of ['Who We Are', 'GLOBAL NETWORK', 'DISTRIBUTOR PARTNER', 'Fluids Parts &amp; Stuff (FPS) was', 'Operating as a wholesale distributor', 'TROY served as', 'Mercofilter carried', 'distributor offices']) expect(html).not.toContain(original);
        for (const translated of ['REDE GLOBAL', 'PARCEIRO DISTRIBUIDOR', 'DISTRIBUIDOR EXCLUSIVO', 'Escritórios do distribuidor FPS', 'Armazém da SAISA', 'Equipe da COBARCA']) expect(html).toContain(translated);
      }
    });
    it(lang + ' renders every engineering principle and preserves technical identifiers', () => {
      const html = render(<OurPhilosophyPage />);
      expect(html).toContain(lang === 'pt' ? 'Nossa Filosofia de Engenharia' : lang === 'es' ? 'Nuestra Filosofía de Ingeniería' : 'Our Engineering Philosophy');
      expect((html.match(/<h3\b/g) || []).length).toBe(7);
      for (const original of ['70-80%', '1–5 µm', 'HPCR', 'ISO 16889', 'ISO 5011', 'ISO 4406', 'MACROCORE™', 'SYNTAPORE™', 'NANOFORCE™']) expect(html).toContain(original);
      if (lang === 'pt') {
        for (const original of ['ENGINEERING DOCTRINE', 'Our Engineering Philosophy', 'GUIDING PRINCIPLES', 'Reliability is the objective.']) expect(html).not.toContain(original);
        expect(html).toContain('7 PRINCÍPIOS ORIENTADORES');
        expect(html).toContain('A confiabilidade é o objetivo.');
      }
    });
  }
});
