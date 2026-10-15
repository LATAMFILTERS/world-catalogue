import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { localeInstances } from '../../i18n-locales';
import { PageHeader } from '../../components/PageHeader';
import Link from '../../components/LocalizedLink';

vi.mock('next/navigation', () => ({ usePathname: () => '/about/' }));
vi.mock('next/link', () => ({ default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function TestLink(props, ref) { return <a ref={ref} {...props} />; }) }));

describe('Public header and links render in the selected language', () => {
  for (const lang of ['en', 'es', 'pt'] as const) {
    it(lang + ' renders correct home, industries and contact destinations', () => {
      const instance = lang === 'en' ? i18n : localeInstances[lang];
      const html = renderToStaticMarkup(<I18nextProvider i18n={instance}><PageHeader currentPage="Mining" /><Link href="/contact/?intent=application-support#form">Contact</Link></I18nextProvider>);
      const prefix = lang === 'en' ? '' : '/' + lang;
      expect(html).toContain('href="' + prefix + '/"');
      expect(html).toContain('href="' + prefix + '/industries/"');
      expect(html).toContain('href="' + prefix + '/contact/?intent=application-support#form"');
      expect(html).not.toContain('/en/');
      expect(html).toContain(lang === 'es' ? 'Sistemas de filtración minera' : lang === 'pt' ? 'Sistemas de filtração para mineração' : 'Mining');
    });
  }
});
