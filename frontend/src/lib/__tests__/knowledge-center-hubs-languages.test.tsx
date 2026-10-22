import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { localeInstances } from '../../i18n-locales';
import { LOCALIZED_ROUTES } from '../localized-routes';
import { TRANSLATED_HUB_SLUGS } from '../knowledge-center-data/i18n/titles';
import { LOCALIZED_HUBS } from '../../app/knowledge-center/localized-hubs';

vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/es/knowledge-center/', useSearchParams: () => new URLSearchParams(), useRouter: () => ({ push() {}, replace() {} }) }));
vi.mock('motion/react', () => {
  const tag = (name: string) => React.forwardRef<HTMLElement, Record<string, unknown>>(function Motion({ initial, animate, transition, whileHover, whileInView, viewport, exit, layout, ...props }, ref) {
    void initial; void animate; void transition; void whileHover; void whileInView; void viewport; void exit; void layout;
    return React.createElement(name, { ...props, ref });
  });
  return { motion: new Proxy({}, { get: (_target, name: string) => tag(name) }), AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</> };
});

describe('Knowledge Center section hubs in Spanish and Portuguese', () => {
  it('every hub has /es/ and /pt/ metadata and a published route', () => {
    expect(Object.keys(LOCALIZED_HUBS).sort()).toEqual([...TRANSLATED_HUB_SLUGS].sort());
    for (const hub of TRANSLATED_HUB_SLUGS) expect(LOCALIZED_ROUTES).toContain(`/knowledge-center/${hub}`);
  });

  for (const lang of ['es', 'pt'] as const) {
    for (const hub of TRANSLATED_HUB_SLUGS) {
      it(`${lang}/${hub}: every reviewed string on the page has a ${lang} translation`, async () => {
        const instance = localeInstances[lang];
        const missing: string[] = [];
        const t = instance.t.bind(instance);
        const spy = vi.spyOn(instance, 't').mockImplementation(((key: string, opts?: { defaultValue?: string }) => {
          if (typeof key === 'string' && key.startsWith('reviewedCopy.') && opts?.defaultValue && !instance.exists(key)) missing.push(opts.defaultValue);
          return t(key as never, opts as never);
        }) as typeof instance.t);
        const Page = (await import(`../../app/knowledge-center/${hub}/page.tsx`)).default;
        renderToStaticMarkup(<I18nextProvider i18n={instance}><Page /></I18nextProvider>);
        spy.mockRestore();
        expect(missing).toEqual([]);
      });
    }
  }
});
