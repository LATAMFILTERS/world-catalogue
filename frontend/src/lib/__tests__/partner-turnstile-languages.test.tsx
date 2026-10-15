import React from 'react';
import { describe, expect, it } from 'vitest';
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
import PartnerTurnstile from '../../app/distributor-application/PartnerTurnstile';
describe('Partner verification language messages', () => {
  it('registers every verification error and retry label in three languages', () => {
    const file='src/app/distributor-application/PartnerTurnstile.tsx';
    const tree=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),99,true,4);
    let count=0;
    function visit(n: ts.Node) {
      if(ts.isStringLiteral(n) && (/Código:|verificación/.test(n.text))) {
        for(const bundle of [en,es,pt]) expect((bundle.reviewedCopy as Record<string,string>)[reviewedCopyKey(n.text).split('.')[1]],n.text).toBeTruthy();
        count++;
      }
      ts.forEachChild(n,visit);
    }
    visit(tree);expect(count).toBeGreaterThanOrEqual(8);
  });
  for(const lang of ['en','es','pt'] as const) it(`${lang} renders configuration error and retry without running verification`,()=>{
    const html=renderToStaticMarkup(<I18nextProvider i18n={lang==='en'?i18n:localeInstances[lang]}><PartnerTurnstile onVerify={()=>{throw new Error('Must not verify during render');}} /></I18nextProvider>);
    if(!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY){
      expect(html).toContain('SITEKEY_MISSING');
      expect(html).toContain(lang==='es'?'Reintentar verificación':lang==='pt'?'Tentar verificar novamente':'Retry verification');
      expect(html).toContain('type="button"');
    }
  });
});
