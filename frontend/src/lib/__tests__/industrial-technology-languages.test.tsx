import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { reviewedCopyKey } from '../reviewed-copy-key';
import { INDUSTRIAL_PROCESS_PLATFORMS } from '../industrial-process-architecture';
import { IndustrialProcessTechnologyStablePage } from '../../components/IndustrialProcessTechnologyStablePage';
vi.mock('next/navigation', () => ({ usePathname: () => '/industrial-process/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
describe('Industrial technology shared presentation in three languages',()=>{
 for(const lang of ['en','es','pt'] as const)for(const platform of INDUSTRIAL_PROCESS_PLATFORMS)for(const technology of platform.technologies)it(`${lang} ${technology.name} translates headings and preserves technical identities and inquiry destination`,()=>{
  const instance=lang==='en'?i18n:localeInstances[lang],before=JSON.stringify({platform,technology});
  const html=renderToStaticMarkup(<I18nextProvider i18n={instance}><IndustrialProcessTechnologyStablePage platform={platform} technology={technology}/></I18nextProvider>).replaceAll('&amp;','&');
  for(const text of ['OPERATING REALITY','Key engineering inputs','SPECIFICATION & SELECTION','TECHNICAL REVIEW PATH','EXPLORE RELATED TECHNOLOGIES']){
   expect(instance.exists(reviewedCopyKey(text))).toBe(true);
   expect(html).toContain(String(instance.t(reviewedCopyKey(text))));
   if(lang!=='en')expect(html).not.toContain('>'+text+'<');
  }
  if(['GAIRFIL™','HE-CRIVA™','MA-TREA™','FUMEVRA™'].includes(technology.name)){
   const fields=[technology.title,technology.summary,technology.treatmentFunction,...technology.mechanisms,...technology.applications,...technology.conditions,...technology.selectionInputs,...technology.serviceSignals,...(technology.customFaqs??[]).flat(),...(technology.subfamilies??[]),...(technology.engineeringNotes??[]).flatMap(note=>[note.title,note.body])];
   for(const text of fields){
    expect(instance.exists(reviewedCopyKey(text)),text).toBe(true);
    const translated=String(instance.t(reviewedCopyKey(text)));
    expect(html).toContain(renderToStaticMarkup(<>{translated}</>).replaceAll('&amp;','&'));
    if(lang!=='en')expect(translated,text).not.toBe(text);
   }
  }
  expect(html).toContain(technology.name);
  expect(html).toContain(platform.name);
  expect(html).toContain(`href="${lang==='en'?'/':'/'+lang+'/'}"`);
  expect(html).toContain(`href="mailto:applications@elimfilters.com?subject=${encodeURIComponent(`${technology.name} Industrial & Process Application Assessment`)}"`);
  expect(html).toContain('data-conversion-action="application-support"');
  expect(html).toContain('application/ld+json');
  expect(JSON.stringify({platform,technology})).toBe(before);
 });
});
