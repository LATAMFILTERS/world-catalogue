import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import fs from 'node:fs';
import ts from 'typescript';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { reviewedCopyKey } from '../reviewed-copy-key';
import { INDUSTRIAL_PROCESS_PLATFORMS, industrialProcessTechnologyUrl } from '../industrial-process-architecture';
import en from '../../../public/locales/en/translation.json';
import es from '../../../public/locales/es/translation.json';
import pt from '../../../public/locales/pt/translation.json';
import { IndustrialProcessPlatformStablePage } from '../../components/IndustrialProcessPlatformStablePage';
vi.mock('next/navigation', () => ({ usePathname: () => '/industrial-process/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
describe('Five industrial platform language presentations',()=>{
  it('covers every visible platform field, summary, fallback and literal',()=>{
    function translated(text:string){for(const bundle of [en,es,pt])expect((bundle.reviewedCopy as Record<string,string>)[reviewedCopyKey(text).split('.')[1]],text).toBeTruthy();}
    function data(value:unknown){if(typeof value==='string')translated(value);else if(Array.isArray(value))value.forEach(data);else if(value&&typeof value==='object')for(const [key,item]of Object.entries(value))if(key!=='technologySlug')data(item);}
    for(const p of INDUSTRIAL_PROCESS_PLATFORMS){
      for(const value of [p.descriptor,p.summary,p.positioning,p.selectionContext,p.selectionGuide,p.qualificationGroups])data(value);
      for(const t of p.technologies){data(t.summary);if(t.title!==t.name)data(t.title);}
      translated(p.descriptor+' industrial application context');
      translated(`${p.name} organizes the available treatment mechanisms so selection begins with the actual process condition, contaminant behavior and required outcome.`);
    }
    const file='src/components/IndustrialProcessPlatformStablePage.tsx',tree=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),99,true,4);
    function literals(n:ts.Node){if(ts.isStringLiteral(n))translated(n.text);ts.forEachChild(n,literals);}
    function visit(n:ts.Node){
      if(ts.isJsxText(n))expect(/[A-Za-z]{3}/.test(n.text.trim()),n.text).toBe(false);
      if(ts.isJsxAttribute(n)&&n.name.getText(tree)==='text'&&n.initializer&&ts.isJsxExpression(n.initializer)&&n.initializer.expression&&ts.isStringLiteral(n.initializer.expression))translated(n.initializer.expression.text);
      if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.QuestionQuestionToken){if(ts.isArrayLiteralExpression(n.right))literals(n.right);else if(ts.isStringLiteral(n.right))translated(n.right.text);}
      ts.forEachChild(n,visit);
    }visit(tree);
  });
  for(const lang of ['en','es','pt'] as const)for(const platform of INDUSTRIAL_PROCESS_PLATFORMS)it(`${lang} ${platform.name} preserves identities, engineering data and public destinations`,()=>{
    const instance=lang==='en'?i18n:localeInstances[lang],before=JSON.stringify(platform);
    const html=renderToStaticMarkup(<I18nextProvider i18n={instance}><IndustrialProcessPlatformStablePage platform={platform}/></I18nextProvider>).replaceAll('&amp;','&');
    const text=(value:string)=>String(instance.t(reviewedCopyKey(value),{defaultValue:value}));
    expect(html).toContain(platform.name);
    expect(html).toContain(text('COMMERCIAL TECHNOLOGY PLATFORM'));
    expect(html).toContain(text(platform.descriptor));
    for(const group of platform.qualificationGroups||[])expect(html).toContain(text(group.title));
    for(const t of platform.technologies){expect(html).toContain(t.branded ? t.name : text(t.name));expect(html).toContain(`href="${industrialProcessTechnologyUrl(platform.slug,t.slug)}"`);}
    expect(html).toContain(`href="mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${platform.name} Industrial & Process Platform Review`)}"`);
    expect(html).toContain('data-conversion-action="application-support"');
    expect(html).toContain(`href="${lang==='en'?'/':'/'+lang+'/'}"`);
    expect(html).toContain('href="/industrial-process/"');
    expect(html).toContain(`alt="${text(platform.descriptor+' industrial application context')}"`);
    expect(html).toContain(`${platform.name} ${text('narrows the project to the correct treatment universe without forcing an early product choice.')}`);
    expect(html).toContain('ISO');
    if(lang!=='en')for(const value of ['COMMERCIAL TECHNOLOGY PLATFORM','Representative industrial application context.','Industrial treatment starts with the process problem.','TECHNICAL REVIEW PATH','Return to the five commercial technology platforms.'])expect(html).not.toContain(value);
    expect(JSON.stringify(platform)).toBe(before);
  });
  for(const lang of ['en','es','pt'] as const)it(`${lang} translates optional presentation fallbacks`,()=>{
    const instance=lang==='en'?i18n:localeInstances[lang],platform={...INDUSTRIAL_PROCESS_PLATFORMS[0],positioning:undefined,selectionContext:undefined,qualificationGroups:undefined};
    const html=renderToStaticMarkup(<I18nextProvider i18n={instance}><IndustrialProcessPlatformStablePage platform={platform}/></I18nextProvider>);
    expect(html).toContain(String(instance.t(reviewedCopyKey('TREATMENT SCOPE'),{defaultValue:'TREATMENT SCOPE'})));
    expect(html).toContain(String(instance.t(reviewedCopyKey('Fluid, gas, air or water composition'),{defaultValue:'Fluid, gas, air or water composition'})));
  });
});
