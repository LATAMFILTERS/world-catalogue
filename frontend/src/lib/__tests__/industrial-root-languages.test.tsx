import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import fs from 'node:fs';
import ts from 'typescript';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { reviewedCopyKey } from '../reviewed-copy-key';
import { INDUSTRIAL_PROCESS_PLATFORMS, industrialProcessPlatformUrl, industrialProcessTechnologyUrl } from '../industrial-process-architecture';
import en from '../../../public/locales/en/translation.json';
import es from '../../../public/locales/es/translation.json';
import pt from '../../../public/locales/pt/translation.json';
import Page, { metadata } from '../../app/industrial-process/page';
vi.mock('next/navigation', () => ({ usePathname: () => '/industrial-process/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
describe('Industrial & Process root language coverage',()=>{
  it('covers literal copy, qualification inputs and every visible platform descriptor',()=>{
    function translated(text:string){for(const bundle of [en,es,pt])expect((bundle.reviewedCopy as Record<string,string>)[reviewedCopyKey(text).split('.')[1]],text).toBeTruthy();}
    const file='src/app/industrial-process/page.tsx',tree=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),99,true,4);
    function visit(n:ts.Node){
      if(ts.isJsxText(n))expect(/[A-Za-z]{3}/.test(n.text.trim()),n.text).toBe(false);
      if(ts.isVariableDeclaration(n)&&n.name.getText(tree)==='projectInputs'&&n.initializer)for(const item of (n.initializer as ts.ArrayLiteralExpression).elements)if(ts.isStringLiteral(item))translated(item.text);
      if(ts.isJsxAttribute(n)&&n.name.getText(tree)==='text'&&n.initializer&&ts.isJsxExpression(n.initializer)&&n.initializer.expression&&ts.isStringLiteral(n.initializer.expression))translated(n.initializer.expression.text);
      ts.forEachChild(n,visit);
    }visit(tree);
    for(const p of INDUSTRIAL_PROCESS_PLATFORMS){translated(p.descriptor);translated(p.summary);for(const t of p.technologies)if(t.name!==t.title)translated(t.title);}
  });
  for(const lang of ['en','es','pt'] as const)it(`renders ${lang} while preserving names, architecture and inquiry links`,()=>{
    const before=JSON.stringify(INDUSTRIAL_PROCESS_PLATFORMS);
    const html=renderToStaticMarkup(<I18nextProvider i18n={lang==='en'?i18n:localeInstances[lang]}><Page /></I18nextProvider>);
    const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
    expect(main).toContain(lang==='es'?'DISEÑE EL PROCESO.':lang==='pt'?'PROJETE O PROCESSO.':'ENGINEER THE PROCESS.');
    for(const p of INDUSTRIAL_PROCESS_PLATFORMS){
      expect(main).toContain(p.name);expect(main).toContain(`href="${industrialProcessPlatformUrl(p.slug)}"`);
      for(const t of p.technologies){expect(main).toContain(t.name);expect(main).toContain(`href="${industrialProcessTechnologyUrl(p.slug,t.slug)}"`);}
    }
    expect((main.match(/<article\b/g)||[]).length).toBe(10);
    expect(main).toContain('href="mailto:info@elimfilters.com?subject=Industrial%20%26%20Process%20Engineering%20Review&amp;body=Company%3A');
    expect(main).toContain('href="'+(lang==='en'?'':'/'+lang)+'/contact/"');
    expect(main).toContain('data-conversion-action="industrial-engineering-review"');
    expect(main).toContain('href="/knowledge-center/canonical/ip-industrial-process-architecture/"');
    if(lang!=='en')for(const text of ['ENGINEER THE PROCESS.','HIGH-VALUE INDUSTRIAL PROJECTS','General contact','Air Technologies','Molecular Air Treatment','What we need to evaluate an industrial project.'])expect(main).not.toContain(text);
    expect(JSON.stringify(INDUSTRIAL_PROCESS_PLATFORMS)).toBe(before);
    expect(metadata.alternates?.canonical).toBe('/industrial-process/');
  });
});
