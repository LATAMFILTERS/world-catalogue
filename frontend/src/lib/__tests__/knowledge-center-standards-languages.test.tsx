import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { KC_STANDARDS } from '../knowledge-center-data';
import { TRANSLATED_STANDARD_SLUGS } from '../knowledge-center-data/i18n/titles';
import { translatedStandard } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import StandardContent from '../../app/knowledge-center/standards/[standard]/StandardContent';
import StandardApplyCta from '../../app/knowledge-center/standards/[standard]/StandardApplyCta';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/standards/iso-4406/' }));
vi.mock('motion/react', () => {
  const tag = (name: string) => React.forwardRef<HTMLElement, Record<string, unknown>>(function Motion({ initial, animate, transition, whileHover, whileInView, viewport, ...props }, ref) {
    void initial; void animate; void transition; void whileHover; void whileInView; void viewport;
    return React.createElement(name, { ...props, ref });
  });
  return { motion: new Proxy({}, { get: (_target, name: string) => tag(name) }) };
});

const numbers = (text: string) => (text.match(/\d+(?:[.,]\d+)*/g) ?? []).sort().join(' ');

function compare(en: unknown, tr: unknown, path: string, problems: string[]) {
  if (typeof en === 'string') {
    if (typeof tr !== 'string' || (en.trim() && !tr.trim())) problems.push(`${path}: missing text`);
    else if (numbers(en) !== numbers(tr)) problems.push(`${path}: numbers ${numbers(en)} ≠ ${numbers(tr)}`);
  } else if (Array.isArray(en)) {
    if (!Array.isArray(tr) || tr.length !== en.length) problems.push(`${path}: ${Array.isArray(tr) ? tr.length : 'no'} items, expected ${en.length}`);
    else en.forEach((item, i) => compare(item, tr[i], `${path}[${i}]`, problems));
  } else if (en && typeof en === 'object') {
    const keys = Object.keys(en);
    if (!tr || typeof tr !== 'object' || Object.keys(tr).sort().join() !== [...keys].sort().join()) problems.push(`${path}: different fields`);
    else for (const key of keys) compare((en as Record<string, unknown>)[key], (tr as Record<string, unknown>)[key], `${path}.${key}`, problems);
  } else if (en !== tr) problems.push(`${path}: ${String(en)} ≠ ${String(tr)}`);
}

describe('Knowledge Center standards pages in Spanish and Portuguese', () => {
  for (const slug of TRANSLATED_STANDARD_SLUGS) {
    for (const lang of ['es', 'pt'] as const) {
      it(`${lang}/${slug} keeps the English structure, identifiers, official title and every number`, () => {
        const en = KC_STANDARDS.find((s) => s.slug === slug)!;
        const tr = translatedStandard(slug, lang);
        const problems: string[] = [];
        compare(en, tr, slug, problems);
        expect(problems).toEqual([]);
        for (const id of ['slug', 'code', 'entityId', 'title', 'issuingOrganization', 'revisionStatus', 'applicableSystems', 'relatedArticles', 'relatedTechnologies'] as const) expect(tr[id]).toEqual(en[id]);
        expect(tr.metaDescription).not.toBe(en.metaDescription);
      });
    }
    it(`${slug} is a published /es/ and /pt/ route`, () => expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/standards/${slug}`));
  }

  it('renders the Spanish standard page without English interface labels', () => {
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><StandardContent std={translatedStandard('iso-4406', 'es')} /><StandardApplyCta /></I18nextProvider>);
    const text = html.replace(/<[^>]*>/g, ' ');
    expect(text).toContain('Qué no define la ISO 4406');
    for (const spanish of ['ESTADO DEL CICLO DE VIDA', 'PARÁMETROS CLAVE', 'NORMA INDUSTRIAL', 'PREGUNTAS FRECUENTES', 'SOLICITAR SOPORTE DE APLICACIONES']) expect(text).toContain(spanish);
    for (const label of ['LIFECYCLE STATUS', 'KEY PARAMETERS', 'COMMON ENGINEERING MISTAKES', 'ENGINEERING REFERENCES', 'RELATED TOPICS', 'STANDARD REFERENCE', 'APPLY THE STANDARD REFERENCE', 'Related Engineering Content']) expect(text).not.toContain(label);
  });
});
