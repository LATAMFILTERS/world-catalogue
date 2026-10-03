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

/** English route ('/' or '/path', no trailing slash) for any current pathname, /es/ and /pt/ included. */
export function englishRouteOf(pathname: string | null | undefined): string {
  const stripped = (pathname || '/').replace(/^\/(es|pt)(?=\/|$)/, '').replace(/\/+$/, '');
  return stripped || '/';
}

/**
 * URL of the current page in `lang` when that page has a published /es/ and /pt/ version,
 * otherwise null (the visitor stays on the English URL and the page is translated in place).
 */
export function languageHref(pathname: string | null | undefined, lang: PageLang): string | null {
  const route = englishRouteOf(pathname);
  return LOCALIZED_ROUTES.includes(route) ? localizedPath(route, lang) : null;
}
