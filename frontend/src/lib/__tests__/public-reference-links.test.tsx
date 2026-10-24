import { AIEntityCard } from '../../components/AIEntityCard';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { PublicReferenceLink, hasPublishedReferenceRoute } from '../../components/PublicReferenceLink';
vi.mock('next/link', async () => ({ default: (await import('react')).forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props,ref){return <a {...props} ref={ref}/>;}) }));
describe('References respect the published standards registry',()=>{
 it('retains unlisted and retired standards as readable text with the same styles',()=>{
  for(const slug of ['astm-d6210','iso-3724','iso-4405','nfpa-t2-14']){
   expect(hasPublishedReferenceRoute(`/knowledge-center/standards/${slug}/`)).toBe(false);
   expect(hasPublishedReferenceRoute(`/es/knowledge-center/standards/${slug}/?context=family#scope`)).toBe(false);
   const html=renderToStaticMarkup(<PublicReferenceLink href={`/knowledge-center/standards/${slug}/`} className="reference" style={{color:'#fff'}}>{slug}</PublicReferenceLink>);
   expect(html).toBe(`<span class="reference" style="color:#fff">${slug}</span>`);
  }
 });
 for(const lang of ['en','es','pt'] as const)it(`${lang} preserves published routes, locale navigation, query and fragments`,()=>{
  const instance=lang==='en'?i18n:localeInstances[lang];
  const html=renderToStaticMarkup(<I18nextProvider i18n={instance}><PublicReferenceLink href="/knowledge-center/standards/iso-16889/?context=family#scope">ISO 16889</PublicReferenceLink><PublicReferenceLink href="/contact/?topic=standards#form">Contact</PublicReferenceLink></I18nextProvider>);
  // ISO 16889 has published /es/ and /pt/ versions, so the link follows the visitor's language.
  expect(html).toContain(`href="${lang==='en'?'':'/'+lang}/knowledge-center/standards/iso-16889/?context=family#scope"`);
  expect(html).toContain(`href="${lang==='en'?'':'/'+lang}/contact/?topic=standards#form"`);
 });
 it('preserves hidden coolant context without linking to an unpublished ASTM page',()=>{
  const html=renderToStaticMarkup(<I18nextProvider i18n={i18n}><AIEntityCard kind="family" slug="coolant-filters"/></I18nextProvider>);
  expect(html).toContain('<section hidden=""');
  expect(html).toContain('ASTM D6210');
  expect(html).not.toContain('href="/knowledge-center/standards/astm-d6210/"');
  expect(html).toContain('href="/technologies/thermacore/"');
 });
 it('leaves external, mail, fragment and other internal destinations alone',()=>{
  for(const href of ['https://www.iso.org/standard/','mailto:applications@elimfilters.com','#scope','/knowledge-center/','/engineering/standards/STD-ISO-16889/'])expect(hasPublishedReferenceRoute(href)).toBe(true);
 });
});
