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
import Cookies from '../../app/legal/cookies/page';
import AcceptableUse from '../../app/legal/acceptable-use/page';
import AiPolicy from '../../app/legal/ai-policy/page';
import Copyright from '../../app/legal/copyright/page';
import Privacy from '../../app/legal/privacy/page';
import Terms from '../../app/legal/terms/page';
import Disclaimer from '../../app/legal/disclaimer/page';
import Warranty from '../../app/legal/warranty/page';
import CrossReference from '../../app/legal/cross-reference/page';
vi.mock('next/navigation', () => ({ usePathname: () => '/legal/cookies/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
const pages = [
  { slug:'cookies', Component:Cookies, sections:9, titles:{en:'Cookie Policy',es:'Política de cookies',pt:'Política de cookies'}, identity:['Google Analytics 4','PostHog','Microsoft Clarity','Part Search','info@elimfilters.com'] },
  { slug:'acceptable-use', Component:AcceptableUse, sections:9, titles:{en:'Acceptable Use Policy',es:'Política de uso aceptable',pt:'Política de uso aceitável'}, identity:['ELIMFILTERS','support@elimfilters.com'] },
  { slug:'ai-policy', Component:AiPolicy, sections:10, titles:{en:'AI &amp; Computational Modeling Policy',es:'Política de IA y modelado computacional',pt:'Política de IA e modelagem computacional'}, identity:['ELIMFILTERS','info@elimfilters.com'] },
  { slug:'copyright', Component:Copyright, sections:9, titles:{en:'Copyright &amp; DMCA Policy',es:'Política de derechos de autor y DMCA',pt:'Política de direitos autorais e DMCA'}, identity:['MACROCORE™','MICROKAPPA™','DRYCORE™','INTEKCORE™','SYNTAPORE™','SYNTRAX™','NANOFORCE™','HYDROCORE™','THERMACORE™','DURATECH™','MARINECLEAN™','Caterpillar','Cummins','Komatsu','Volvo','Deutz','John Deere','info@elimfilters.com','Digital Millennium Copyright Act (DMCA)'] },
  { slug:'privacy', Component:Privacy, sections:17, titles:{en:'Privacy Policy',es:'Política de privacidad',pt:'Política de privacidade'}, identity:['Kleo Technology LLC','Texas','Part Search','Knowledge System','Google Analytics 4','PostHog','Microsoft Clarity','Microsoft 365','WhatsApp','Instagram','Facebook','LinkedIn','Privacy Appeal','13','info@elimfilters.com'] },
  { slug:'terms', Component:Terms, sections:18, titles:{en:'Terms of Service',es:'Condiciones del servicio',pt:'Termos de serviço'}, identity:['Kleo Technology LLC','Collin County, Texas','US$100','MACROCORE™','MICROKAPPA™','DRYCORE™','INTEKCORE™','SYNTAPORE™','HYDROCORE™','SYNTRAX™','NANOFORCE™','THERMACORE™','MARINECLEAN™','DURATECH™','info@elimfilters.com'] },
  { slug:'disclaimer', Component:Disclaimer, sections:10, titles:{en:'Legal Disclaimer',es:'Aviso legal',pt:'Aviso legal'}, identity:['ISO, SAE, ASTM, DIN, NFPA','OEM','Beta','info@elimfilters.com'] },
  { slug:'warranty', Component:Warranty, sections:12, titles:{en:'Product Warranty &amp; Claims Policy',es:'Política de garantía del producto y reclamaciones',pt:'Política de garantia do produto e reclamações'}, identity:['Kleo Technology LLC','ELIMFILTERS®','VIN','Warranty Claim','2026','info@elimfilters.com'] },
  { slug:'cross-reference', Component:CrossReference, sections:8, titles:{en:'Cross Reference Policy',es:'Política de referencias cruzadas',pt:'Política de referências cruzadas'}, identity:['World Catalogue','Part Search','AI Engine','OEM','XR','EQ','ALT','UP','SUP','REVIEW_REQUIRED','Caterpillar','Cummins','Komatsu','Volvo','Deutz','John Deere','Detroit Diesel','Scania','Mercedes-Benz','Perkins','Kubota','JCB','Liebherr','Donaldson','Fleetguard','Baldwin','WIX','MANN-FILTER','Mahle','Hengst','Bosch','Fram','Luber-Finer','Sakura','Filtron','info@elimfilters.com'] },
];
function main(html:string){return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';}
describe('Reviewed public legal language presentation', () => {
  for(const page of pages){
    it(page.slug+' covers the complete legal sections and presentation labels',()=>{
      const file=`src/app/legal/${page.slug}/page.tsx`,source=fs.readFileSync(file,'utf8'),tree=ts.createSourceFile(file,source,99,true,4);
      const paragraphMode=source.includes(".body.split('\\n\\n')");
      function translated(text:string){for(const bundle of [en,es,pt])expect((bundle.reviewedCopy as Record<string,string>)[reviewedCopyKey(text).split('.')[1]],text).toBeTruthy();}
      function collect(n:ts.Node){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){translated(n.text);if(paragraphMode&&ts.isPropertyAssignment(n.parent)&&n.parent.name.getText(tree)==='body')n.text.split('\n\n').forEach(translated);}ts.forEachChild(n,collect);}
      function visit(n:ts.Node){
        if(ts.isVariableDeclaration(n)&&n.name.getText(tree)==='SECTIONS'&&n.initializer)collect(n.initializer);
        if(ts.isVariableDeclaration(n)&&n.name.getText(tree)==='RELATIONSHIP_TYPES'&&n.initializer){for(const item of (n.initializer as ts.ArrayLiteralExpression).elements)for(const property of (item as ts.ObjectLiteralExpression).properties)if(ts.isPropertyAssignment(property)&&['label','body'].includes(property.name.getText(tree)))collect(property.initializer);}
        if(ts.isVariableDeclaration(n)&&n.name.getText(tree)==='RELATED'&&n.initializer){for(const item of (n.initializer as ts.ArrayLiteralExpression).elements)for(const property of (item as ts.ObjectLiteralExpression).properties)if(ts.isPropertyAssignment(property)&&property.name.getText(tree)==='label'&&ts.isStringLiteral(property.initializer))translated(property.initializer.text);}
        if(ts.isJsxText(n)&&n.text.trim()!=='← ELIMFILTERS')expect(/[A-Za-z]{3}/.test(n.text.trim()),n.text).toBe(false);
        if(ts.isJsxAttribute(n)&&n.name.getText(tree)==='text'&&n.initializer&&ts.isJsxExpression(n.initializer)&&n.initializer.expression&&ts.isStringLiteral(n.initializer.expression))translated(n.initializer.expression.text);
        ts.forEachChild(n,visit);
      }visit(tree);
    });
    for(const lang of ['en','es','pt'] as const)it(`${page.slug} renders every section in ${lang} and preserves structure and identities`,()=>{
      const instance=lang==='en'?i18n:localeInstances[lang];
      const html=main(renderToStaticMarkup(<I18nextProvider i18n={instance}><page.Component /></I18nextProvider>));
      const original=main(renderToStaticMarkup(<I18nextProvider i18n={i18n}><page.Component /></I18nextProvider>));
      expect(html).toContain(page.titles[lang]);
      expect((html.match(/<h2\b/g)||[]).length).toBe(page.sections);
      expect((html.match(/<p\b/g)||[]).length).toBe((original.match(/<p\b/g)||[]).length);
      expect((html.match(/<section\b/g)||[]).length).toBe((original.match(/<section\b/g)||[]).length);
      expect(html.match(/href="[^"]*"/g)).toEqual((original.match(/href="[^"]*"/g)||[]).map(href=>lang==='en'?href:href==='href="/"'?`href="/${lang}/"`:href==='href="/contact/"'?`href="/${lang}/contact/"`:href));
      for(const identity of page.identity)expect(html).toContain(identity);
      if(lang!=='en')for(const text of ['Last updated: August 2026','Strictly Necessary Technologies','This Cookie Policy explains','Authorized Use','ELIMFILTERS platforms may be used only','Physical Validation Remains Required','Computational models are not product certification','Related Legal Documents'])expect(html).not.toContain(text);
      if(page.slug==='ai-policy')expect(html).toContain(lang==='es'?'No sustituye la validación física':lang==='pt'?'Ela não substitui a validação física':'It does not replace physical validation');
      if(page.slug==='cross-reference')expect((html.match(/<h3\b/g)||[]).length).toBe(6);
      if(page.slug==='terms')expect(html).toContain(lang==='es'?'DURANTE LOS SEIS MESES':lang==='pt'?'DURANTE OS SEIS MESES':'DURING THE SIX MONTHS');
      if(page.slug==='warranty')expect(html).toContain(lang==='es'?'no crea un único período de garantía universal':lang==='pt'?'não cria um único período de garantia universal':'does not create a single universal warranty period');
    });
  }
});
