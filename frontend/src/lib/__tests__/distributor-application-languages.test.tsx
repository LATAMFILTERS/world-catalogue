import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import fs from 'node:fs';
import ts from 'typescript';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { reviewedCopyKey } from '../reviewed-copy-key';
import en from '../../../public/locales/en/translation.json';
import es from '../../../public/locales/es/translation.json';
import pt from '../../../public/locales/pt/translation.json';
import Application from '../../app/distributor-application/page';
const state = vi.hoisted(() => ({ program: 'country' }));
vi.mock('react', async (getOriginal) => {
  const actual = await getOriginal<typeof import('react')>();
  return { ...actual, useSyncExternalStore: (...args: Parameters<typeof actual.useSyncExternalStore>) => args[0].name === 'subscribeNever' ? state.program : actual.useSyncExternalStore(...args) };
});
vi.mock('next/navigation', () => ({ usePathname: () => '/distributor-application/' }));
vi.mock('../../app/distributor-application/PartnerTurnstile', () => ({ default: () => <div data-testid="turnstile" /> }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
describe('Distributor application language presentation', () => {
  for (const lang of ['en', 'es', 'pt'] as const) it(`${lang} exposes a neutral heading before the client selects the program`, () => {
    state.program = 'loading';
    const html = renderToStaticMarkup(<I18nextProvider i18n={lang === 'en' ? i18n : localeInstances[lang]}><Application /></I18nextProvider>);
    expect(html).toContain('<h1');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('<form');
    expect(html).not.toContain('territorial exclusivity');
    const bundle = { en, es, pt }[lang];
    expect(html).toContain((bundle.reviewedCopy as Record<string, string>)[reviewedCopyKey('Grow With ELIMFILTERS').split('.')[1]]);
  });
  it('covers support, qualification, conditional copy and placeholders without translating field identifiers', () => {
    const file = 'src/app/distributor-application/page.tsx';
    const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function translated(text: string) { for (const bundle of [en, es, pt]) expect((bundle.reviewedCopy as Record<string, string>)[reviewedCopyKey(text).split('.')[1]], text).toBeTruthy(); }
    function literals(n: ts.Node) { if (ts.isStringLiteral(n)) translated(n.text); ts.forEachChild(n, literals); }
    function expression(n: ts.Node) { if (ts.isStringLiteral(n)) translated(n.text); else if (ts.isConditionalExpression(n)) { expression(n.whenTrue); expression(n.whenFalse); } }
    function visit(n: ts.Node) {
      if (ts.isJsxText(n)) expect(/[A-Za-z]{3}/.test(n.text.trim()), n.text).toBe(false);
      if (ts.isVariableDeclaration(n) && ['PROGRAM_SUPPORT','PARTNER_SUPPORT','PARTNER_QUALIFICATION','QUALIFICATION'].includes(n.name.getText(tree)) && n.initializer) literals(n.initializer);
      if (ts.isJsxAttribute(n) && n.name.getText(tree) === 'text' && n.initializer && ts.isJsxExpression(n.initializer) && n.initializer.expression) expression(n.initializer.expression);
      if (ts.isCallExpression(n) && n.expression.getText(tree) === 'formText') for (const arg of n.arguments) expression(arg);
      ts.forEachChild(n, visit);
    }
    visit(tree);
  });
  for (const lang of ['en','es','pt'] as const) for (const mode of ['country','partner']) it(`${lang} renders ${mode} labels and preserves form controls`, () => {
    state.program = mode;
    const html = renderToStaticMarkup(<I18nextProvider i18n={lang === 'en' ? i18n : localeInstances[lang]}><Application /></I18nextProvider>).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
    expect(html).toContain(lang === 'es' ? 'Razón social de la empresa *' : lang === 'pt' ? 'Razão social da empresa *' : 'Company Legal Name *');
    for (const field of ['companyName','legalName','contactName','email','phone','country','state','yearsInBusiness','employees','currentProducts','serviceArea','message']) expect(html).toContain(`name="${field}"`);
    expect((html.match(/ required=""/g) || []).length).toBe(6);
    expect(html).toContain('type="submit" disabled=""');
    expect(html).toContain('data-testid="turnstile"');
    expect((html.match(/<article\b/g) || []).length).toBe(mode === 'country' ? 6 : 4);
    expect(html).toContain('href="' + (lang === 'en' ? '' : '/' + lang) + '/contact/"');
    if (lang !== 'en') for (const text of ['Company Legal Name','Contact Name *','Submit Commercial Partnership Evaluation','Request Country Distributor Review','Describe your country coverage','Technical Resources','One Primary Partner Per Market']) expect(html).not.toContain(text);
    if (mode === 'partner') expect(html).toContain('FOB');
  });
});
