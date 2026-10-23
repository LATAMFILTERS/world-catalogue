import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { KC_SYSTEMS, KC_SYSTEM_DETAILS } from '../knowledge-center-data';
import { TRANSLATED_SYSTEM_SLUGS } from '../knowledge-center-data/i18n/titles';
import { translatedSystem } from '../knowledge-center-data/i18n/articles';
import { LOCALIZED_ROUTES } from '../localized-routes';
import SystemContent from '../../app/knowledge-center/systems/[slug]/SystemContent';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/systems/hydraulic-protection/' }));
vi.mock('motion/react', () => {
  const tag = (name: string) => React.forwardRef<HTMLElement, Record<string, unknown>>(function Motion({ initial, animate, transition, whileHover, ...props }, ref) {
    void initial; void animate; void transition; void whileHover;
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

describe('Knowledge Center protection-system pages in Spanish and Portuguese', () => {
  it('covers every published protection system', () => {
    expect([...TRANSLATED_SYSTEM_SLUGS].sort()).toEqual(KC_SYSTEMS.map((s) => s.slug).sort());
  });

  for (const slug of TRANSLATED_SYSTEM_SLUGS) {
    for (const lang of ['es', 'pt'] as const) {
      it(`${lang}/${slug} keeps the English structure, identifiers and every number`, () => {
        const system = KC_SYSTEMS.find((s) => s.slug === slug)!;
        const tr = translatedSystem(slug, lang);
        const problems: string[] = [];
        compare({ system, detail: KC_SYSTEM_DETAILS[slug] ?? null }, tr, slug, problems);
        expect(problems).toEqual([]);
        for (const id of ['slug', 'icon', 'technologies', 'kits', 'standards'] as const) expect(tr.system[id]).toEqual(system[id]);
        expect(tr.system.description).not.toBe(system.description);
      });
    }
    it(`${slug} is a published /es/ and /pt/ route`, () => expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/systems/${slug}`));
  }

  it('renders the Spanish system page without English interface labels', () => {
    const { system, detail } = translatedSystem('hydraulic-protection', 'es');
    const html = renderToStaticMarkup(<I18nextProvider i18n={localeInstances.es}><SystemContent system={system} detail={detail} /></I18nextProvider>);
    const text = html.replace(/<[^>]*>/g, ' ');
    expect(text).toContain('Protección hidráulica');
    expect(text).toContain('Protocolo de lavado de puesta en marcha');
    for (const spanish of ['Centro de Conocimiento', 'MECANISMO DE FALLA', 'NORMAS RELEVANTES', 'OTROS SISTEMAS', 'Protección de la lubricación']) expect(text).toContain(spanish);
    for (const label of ['FAILURE MECHANISM', 'TARGET CLEANLINESS', 'RELEVANT STANDARDS', 'OTHER SYSTEMS', 'COMMERCIAL KITS', 'ENGINEERING ARTICLES', 'Contamination Target']) expect(text).not.toContain(label);
  });
});
