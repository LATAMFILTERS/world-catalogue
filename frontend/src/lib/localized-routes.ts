import { PRODUCT_FAMILY_LIST } from './product-families-data';

const BASE_URL = 'https://elimfilters.com';

export type PageLang = 'en' | 'es' | 'pt';
export const ROUTE_LANGS = ['es', 'pt'] as const;

/** hreflang / og:locale tags per language. */
export const HREFLANG: Record<PageLang, string> = { en: 'en', es: 'es', pt: 'pt-BR' };
export const OG_LOCALE: Record<PageLang, string> = { en: 'en_US', es: 'es_419', pt: 'pt_BR' };

// English paths (no trailing slash, '/' for home) that have published /es/ and /pt/ twins.
export const LOCALIZED_ROUTES: readonly string[] = [
  '/',
  '/contact',
  '/technologies/hydrocore',
  ...PRODUCT_FAMILY_LIST.map((family) => `/families/${family.slug}`),
];

/** Path of an English route in the given language, always with a trailing slash. */
export function localizedPath(path: string, lang: PageLang): string {
  const clean = path === '/' ? '' : path.replace(/\/+$/, '');
  return lang === 'en' ? `${clean}/` : `/${lang}${clean}/`;
}

/** Absolute hreflang alternates (en, es, pt-BR, x-default) for an English route. */
export function languageAlternates(path: string): Record<string, string> {
  const url = (lang: PageLang) => `${BASE_URL}${localizedPath(path, lang)}`;
  return { en: url('en'), es: url('es'), 'pt-BR': url('pt'), 'x-default': url('en') };
}
