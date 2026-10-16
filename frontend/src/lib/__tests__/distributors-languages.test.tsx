import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import en from '../../../public/locales/en/translation.json';
import es from '../../../public/locales/es/translation.json';
import pt from '../../../public/locales/pt/translation.json';
import { reviewedCopyKey } from '../reviewed-copy-key';
import DistributorsPage from '../../app/distributors/page';
import { GlobalCommercialModel } from '../../components/GlobalCommercialModel';
vi.mock('next/navigation', () => ({ usePathname: () => '/distributors/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
describe('Distributor public language coverage', () => {
  it('covers public prose, tags, partner values and territory labels', () => {
    const file = 'src/app/distributors/page.tsx';
    const tree = ts.createSourceFile(file, fs.readFileSync(path.resolve(file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function translated(text: string) { const key = reviewedCopyKey(text).split('.')[1]; for (const bundle of [en, es, pt]) expect((bundle.reviewedCopy as Record<string, string>)[key], text).toBeTruthy(); }
    function collect(n: ts.Node) { if (ts.isStringLiteral(n)) translated(n.text); ts.forEachChild(n, collect); }
    function visit(n: ts.Node) {
      if (ts.isJsxText(n)) expect(/[A-Za-z]{3}/.test(n.text.trim()), n.text).toBe(false);
      if (ts.isVariableDeclaration(n) && ['TAGS', 'PARTNER_VALUES'].includes(n.name.getText(tree)) && n.initializer) collect(n.initializer);
      if (ts.isPropertyAssignment(n) && ['country', 'region'].includes(n.name.getText(tree)) && ts.isStringLiteral(n.initializer)) translated(n.initializer.text);
      if (ts.isJsxSelfClosingElement(n) && n.tagName.getText(tree) === 'ReviewedText') for (const a of n.attributes.properties) if (ts.isJsxAttribute(a) && a.name.getText(tree) === 'text' && a.initializer && ts.isJsxExpression(a.initializer) && a.initializer.expression && ts.isStringLiteral(a.initializer.expression)) translated(a.initializer.expression.text);
      ts.forEachChild(n, visit);
    }
    visit(tree);
  });
  for (const lang of ['en', 'es', 'pt'] as const) {
    const instance = lang === 'en' ? i18n : localeInstances[lang];
    it(lang + ' renders the distributor page and preserves public contact paths', () => {
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><DistributorsPage /></I18nextProvider>).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
      expect(html).toContain(lang === 'es' ? 'Red de socios comerciales autorizados' : lang === 'pt' ? 'Rede de parceiros comerciais autorizados' : 'Authorized Commercial Partner Network');
      for (const identity of ['TROY, SRL', 'COLSAISA', 'ELIMPERCA', 'Ave. Las Palmas #64, Santo Domingo, Dominican Republic 10905', 'Cl. 17 #82 - 67, Fontibon, Bogota, Colombia', 'Frisco, Texas, United States', '+57 310 611 2190', '80%', '20%']) expect(html).toContain(identity);
      for (const href of ['https://part-search.elimfilters.com', 'https://www.instagram.com/troydominicana/', 'tel:+573106112190', '/distributor-application', '#authorized-distributors']) expect(html).toContain('href="' + href + '"');
      expect(html).toContain('href="' + (lang === 'en' ? '' : '/' + lang) + '/contact/"');
      for (const action of ['distributor-locator', 'partner-application', 'product-intelligence', 'application-support']) expect(html).toContain('data-conversion-action="' + action + '"');
      if (lang !== 'en') for (const text of ['Authorized Commercial Partner Network', 'Find an ELIMFILTERS authorized distributor', 'Regional Coverage.', 'Partner Standards', 'ELIMFILTERS AUTHORIZED DISTRIBUTOR', 'Need a Distributor, a Product Match']) expect(html).not.toContain(text);
      if (lang === 'pt') {
        for (const text of ['THE ELIMFILTERS GLOBAL MODEL', 'PRC MANUFACTURING STRATEGY', 'PHYSICAL VALIDATION', 'MATHEMATICAL MODELING', 'PARTNER VALUE', 'Lifecycle Value', 'The economic distinction is structural.']) expect(html).not.toContain(text);
        for (const text of ['O MODELO GLOBAL ELIMFILTERS', 'ENGENHARIA E TECNOLOGIA', 'INTELIGÊNCIA TÉCNICA', 'PRESENÇA INTERNACIONAL', 'VALOR PARA O PARCEIRO', 'Valor do ciclo de vida', 'evidências documentadas']) expect(html).toContain(text);
      }
    });
    it(lang + ' presents engineering, intelligence and international partnerships with six partner outcomes', () => {
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><GlobalCommercialModel variant="about" /></I18nextProvider>);
      expect((html.match(/<article\b/g) || []).length).toBe(9);
      expect(html).not.toContain('href="/distributor-application"');
      expect(html).toContain('80%'); expect(html).toContain('20%');
      expect(html).toContain(lang === 'pt' ? 'Engenharia avançada de filtração' : lang === 'es' ? 'Ingeniería avanzada de filtración' : 'Advanced Filtration Engineering');
      expect(html).not.toMatch(/\b(?:China|PRC|RPC)\b/i);
    });
  }
});
