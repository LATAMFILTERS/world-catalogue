import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import en from '../../../public/locales/en/translation.json';
import es from '../../../public/locales/es/translation.json';
import pt from '../../../public/locales/pt/translation.json';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { reviewedCopyKey } from '../reviewed-copy-key';
import { ReviewedText } from '../../components/ReviewedText';
import { LubricationSystemPage } from '../../components/LubricationSystemPage';
import { CoolingSystemPage } from '../../components/CoolingSystemPage';
import { FuelCleanlinessSystemPage } from '../../components/FuelCleanlinessSystemPage';
import { AirIntakeSystemPage } from '../../components/AirIntakeSystemPage';
import { HydraulicSystemPage } from '../../components/HydraulicSystemPage';

vi.mock('next/navigation', () => ({ usePathname: () => '/systems/lubrication/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
const bundles = { en, es, pt };
function assertTranslated(text: string, context?: string) {
  const key = reviewedCopyKey(text).split('.')[1] + (context ? '_' + context : '');
  for (const [lang, bundle] of Object.entries(bundles)) expect((bundle.reviewedCopy as Record<string, string>)[key], lang + ': ' + text).toBeTruthy();
}
describe('Reviewed public system copy', () => {
  for (const name of ['Lubrication', 'Hydraulic', 'AirIntake', 'Cooling', 'FuelCleanliness']) {
    const file = 'src/components/' + name + 'SystemPage.tsx';
    it(name + ' has translated literal prose, FAQ, data cards, decision steps and image alt', () => {
      const source = fs.readFileSync(path.resolve(file), 'utf8');
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let data = 0;
      function collect(node: ts.Node) { if (ts.isStringLiteral(node) && !node.text.startsWith('/')) { assertTranslated(node.text); data++; } ts.forEachChild(node, collect); }
      function inJsx(node: ts.Node): boolean { for (let p: ts.Node | undefined = node.parent; p; p = p.parent) if (ts.isJsxExpression(p)) return true; return false; }
      function visit(node: ts.Node) {
        if (ts.isJsxText(node) && /[A-Za-z]{3}/.test(node.text.trim())) expect(/^[A-Z]+™$/.test(node.text.trim()) || node.text.trim() === 'PART SEARCH', node.text).toBe(true);
        if (ts.isVariableDeclaration(node) && ['protectedFunctions', 'domains', 'contamination', 'protectedComponents', 'decision', 'faqs', 'pathways', 'assets', 'standards', 'families'].includes(node.name.getText(tree)) && node.initializer) collect(node.initializer);
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'map' && ts.isArrayLiteralExpression(node.expression.expression) && inJsx(node)) collect(node.expression.expression);
        if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(tree) === 'ReviewedText') {
          let text: string | undefined, context: string | undefined;
          for (const attr of node.attributes.properties) if (ts.isJsxAttribute(attr) && attr.initializer) {
            if (attr.name.getText(tree) === 'text' && ts.isJsxExpression(attr.initializer) && attr.initializer.expression && ts.isStringLiteral(attr.initializer.expression)) text = attr.initializer.expression.text;
            if (attr.name.getText(tree) === 'context' && ts.isStringLiteral(attr.initializer)) context = attr.initializer.text;
          }
          if (text) assertTranslated(text, context);
        }
        if (ts.isJsxAttribute(node) && node.name.getText(tree) === 'alt' && node.initializer && ts.isStringLiteral(node.initializer)) assertTranslated(node.initializer.text);
        ts.forEachChild(node, visit);
      }
      visit(tree);
      expect(data).toBeGreaterThan(30);
      expect(source).not.toContain('key=<');
    });
  }
  for (const lang of ['en', 'es', 'pt'] as const) {
    it(lang + ' renders localized visible system headings, crumbs, steps and family links', () => {
      const instance = lang === 'en' ? i18n : localeInstances[lang];
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><LubricationSystemPage /><HydraulicSystemPage /><AirIntakeSystemPage /><CoolingSystemPage /><FuelCleanlinessSystemPage /></I18nextProvider>);
      const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
      const prefix = lang === 'en' ? '' : '/' + lang;
      expect(visible).toContain('href="' + prefix + '/families/oil-filters/"');
      expect(visible).toContain('href="' + prefix + '/families/hydraulic-filters/"');
      expect(visible).toContain('SYNTRAX™');
      expect(visible).toContain('NANOFORCE™');
      expect(visible).toContain('ISO 4406');
      for (const standard of ['ASTM D6210', 'ASTM D6304', 'ISO 12937', 'ISO 16332']) expect(visible).toContain(standard);
      expect(visible).toContain('TURBOCORE™');
      expect(visible).toContain('href="' + prefix + '/families/coolant-filters/"');
      expect(visible).toContain('href="' + prefix + '/technologies/hydrocore/"');
      for (const standard of ['ISO 5011', 'ISO 11155', 'ISO 8573-1']) expect(visible).toContain(standard);
      expect(visible).toContain('href="' + prefix + '/families/primary-air/"');
      if (lang !== 'en') {
        for (const english of ['LUBRICANT CONTAMINATION CONTROL', 'HYDRAULIC CONTAMINATION CONTROL', 'What is Lubrication Protection?', 'What is Hydraulic Protection?', 'VALIDATED ELIMFILTERS PART', 'Lubrication Protection', 'Hydraulic Protection', 'Air Intake &amp; Airflow Protection', 'AIRFLOW CONTAMINATION CONTROL', 'What is Air Intake', 'THERMAL SYSTEM CONTAMINATION CONTROL', 'DIESEL FUEL CONTAMINATION CONTROL', 'What is Cooling System Protection?', 'What is Fuel Cleanliness Protection?', 'Cooling System Protection', 'Fuel Cleanliness Protection']) expect(visible).not.toContain(english);
        expect(visible).toContain(lang === 'es' ? 'Protección de la' : 'Proteção da');
        expect(visible).toContain(lang === 'es' ? 'PIEZA ELIMFILTERS VALIDADA' : 'PEÇA ELIMFILTERS VALIDADA');
      }
    });
    it(lang + ' removes the original step number only after translation', () => {
      const instance = lang === 'en' ? i18n : localeInstances[lang];
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><ReviewedText text="6. VALIDATED ELIMFILTERS PART" stripNumber /></I18nextProvider>);
      expect(html).toBe(lang === 'es' ? 'PIEZA ELIMFILTERS VALIDADA' : lang === 'pt' ? 'PEÇA ELIMFILTERS VALIDADA' : 'VALIDATED ELIMFILTERS PART');
    });
  }
});
