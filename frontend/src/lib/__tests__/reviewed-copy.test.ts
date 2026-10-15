import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import en from '../../../public/locales/en/translation.json';
import es from '../../../public/locales/es/translation.json';
import pt from '../../../public/locales/pt/translation.json';
import { reviewedCopyKey } from '../reviewed-copy-key';
import { FAMILY_ES, SYSTEM_ES } from '../families-es';
import { FAMILY_PT, SYSTEM_PT } from '../families-pt';
import { PRODUCT_FAMILY_LIST } from '../product-families-data';
import { PROTECTION_SYSTEM_LIST } from '../protection-systems-data';

const bundles = { en, es, pt };
function assertTranslated(text: string) {
  const key = reviewedCopyKey(text).split('.')[1];
  for (const [lang, bundle] of Object.entries(bundles)) {
    expect((bundle.reviewedCopy as Record<string, string>)[key], lang + ': ' + text).toBeTruthy();
  }
}

describe('Public parent-page editorial coverage', () => {
  for (const file of ['src/app/families/page.tsx', 'src/app/systems/page.tsx', 'src/app/technologies/page.tsx', 'src/components/MacrocoreStablePage.tsx', 'src/components/SyntraxStablePage.tsx', 'src/components/NanoforceStablePage.tsx', 'src/components/DrycoreStablePage.tsx', 'src/components/IntekcoreStablePage.tsx', 'src/components/MicrokappaStablePage.tsx', 'src/components/ThermacoreStablePage.tsx', 'src/components/SyntaporeStablePage.tsx']) {
    it(file + ' has no fixed untranslated prose', () => {
      const source = fs.readFileSync(path.resolve(file), 'utf8');
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function visit(node: ts.Node) {
        if (ts.isJsxText(node)) {
          const text = node.text.trim();
          if (/[a-zA-Z]{3}/.test(text)) expect(text === 'PART SEARCH' || /^[A-Z]+™$/.test(text)).toBe(true);
        }
        if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(tree) === 'ReviewedText') {
          const attribute = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(tree) === 'text');
          if (attribute && ts.isJsxAttribute(attribute) && attribute.initializer && ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression && ts.isStringLiteral(attribute.initializer.expression)) assertTranslated(attribute.initializer.expression.text);
        }
        ts.forEachChild(node, visit);
      }
      visit(tree);
      expect(source).not.toContain('key=<');
    });
  }
  it('reuses approved names and descriptions for every family and system', () => {
    for (const family of PRODUCT_FAMILY_LIST) {
      for (const bundle of [FAMILY_ES, FAMILY_PT]) {
        expect(bundle[family.slug]?.name).toBeTruthy();
        expect(bundle[family.slug]?.purpose).toBeTruthy();
      }
    }
    for (const system of PROTECTION_SYSTEM_LIST) {
      expect(SYSTEM_ES[system.slug]?.name).toBeTruthy();
      expect(SYSTEM_PT[system.slug]?.name).toBeTruthy();
      assertTranslated(system.tagline);
    }
  });
  for (const file of ['src/app/systems/page.tsx', 'src/app/technologies/page.tsx', 'src/components/MacrocoreStablePage.tsx', 'src/components/SyntraxStablePage.tsx', 'src/components/NanoforceStablePage.tsx', 'src/components/DrycoreStablePage.tsx', 'src/components/IntekcoreStablePage.tsx', 'src/components/MicrokappaStablePage.tsx', 'src/components/ThermacoreStablePage.tsx', 'src/components/SyntaporeStablePage.tsx']) {
    it(file + ' translates every FAQ question and answer', () => {
      const source = fs.readFileSync(path.resolve(file), 'utf8');
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let questions = 0;
      function visit(node: ts.Node) {
        if (ts.isVariableDeclaration(node) && ['faq', 'faqs'].includes(node.name.getText(tree)) && node.initializer) {
          const collect = (child: ts.Node) => { if (ts.isStringLiteral(child)) { assertTranslated(child.text); questions += 1; } ts.forEachChild(child, collect); };
          let value = node.initializer;
          while (ts.isAsExpression(value)) value = value.expression;
          if (ts.isArrayLiteralExpression(value)) collect(value);
        }
        ts.forEachChild(node, visit);
      }
      visit(tree);
      expect(questions).toBeGreaterThanOrEqual(10);
    });
  }
});

describe('Reviewed technology selection and diagnostic lists', () => {
  for (const file of ['src/components/MacrocoreStablePage.tsx', 'src/components/SyntraxStablePage.tsx', 'src/components/NanoforceStablePage.tsx', 'src/components/DrycoreStablePage.tsx', 'src/components/IntekcoreStablePage.tsx', 'src/components/MicrokappaStablePage.tsx', 'src/components/ThermacoreStablePage.tsx', 'src/components/SyntaporeStablePage.tsx']) {
    it(file + ' translates every selection and service list entry', () => {
      const source = fs.readFileSync(path.resolve(file), 'utf8');
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let entries = 0;
      function collect(node: ts.Node) {
        if (ts.isStringLiteral(node)) { assertTranslated(node.text); entries += 1; }
        ts.forEachChild(node, collect);
      }
      function inJsx(node: ts.Node): boolean { for (let current: ts.Node | undefined = node.parent; current; current = current.parent) if (ts.isJsxExpression(current)) return true; return false; }
      function visit(node: ts.Node) {
        if (ts.isVariableDeclaration(node) && ['positions', 'conditions', 'parameters', 'errors', 'applications', 'riskIndustries', 'selectionQuestions', 'selectionErrors', 'serviceSignals', 'failureRisks'].includes(node.name.getText(tree)) && node.initializer) collect(node.initializer);
        if (ts.isCallExpression(node) && node.expression.getText(tree) === 'list') node.arguments.forEach(collect);
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'map' && ts.isArrayLiteralExpression(node.expression.expression) && inJsx(node)) collect(node.expression.expression);
        ts.forEachChild(node, visit);
      }
      visit(tree);
      expect(entries).toBeGreaterThan(20);
    });
  }
});

describe('Reviewed technology accessibility', () => {
  for (const name of ['Macrocore', 'Syntrax', 'Nanoforce', 'Drycore', 'Intekcore', 'Microkappa', 'Thermacore', 'Syntapore']) {
    it(name + ' translates image descriptions and breadcrumb label', () => {
      const file = 'src/components/' + name + 'StablePage.tsx';
      const source = fs.readFileSync(path.resolve(file), 'utf8');
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let images = 0;
      function visit(node: ts.Node) {
        if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(tree) === 'ReviewedImage') {
          const alt = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(tree) === 'alt');
          if (alt && ts.isJsxAttribute(alt) && alt.initializer && ts.isStringLiteral(alt.initializer)) { if (!/^[A-Z]+™$/.test(alt.initializer.text)) assertTranslated(alt.initializer.text); images++; }
        }
        ts.forEachChild(node, visit);
      }
      visit(tree);
      expect(images).toBeGreaterThanOrEqual(2);
      expect(source).toContain('<ReviewedBreadcrumb');
    });
  }
});
