'use client';

import { createInstance, type i18n as I18nInstance } from 'i18next';
import esTranslation from '../public/locales/es/translation.json';
import ptTranslation from '../public/locales/pt/translation.json';
import {
  GOVERNED_ES_OVERRIDES,
  GOVERNED_PT_OVERRIDES,
  governedEnTranslation,
  setNestedValue,
} from './i18n';

// Dedicated, synchronously initialised instances for the published locale routes (/es/, /pt/),
// so their static HTML is rendered in that language. The global instance stays English and keeps
// its runtime geo switching for every other route.
export type RouteLocale = 'es' | 'pt';

export const ROUTE_LOCALES: readonly RouteLocale[] = ['es', 'pt'];

/** Value for <html lang> and hreflang. */
export const LOCALE_TAG: Record<RouteLocale, string> = { es: 'es', pt: 'pt-BR' };

function governed(bundle: unknown, overrides: Record<string, string>) {
  const tree = JSON.parse(JSON.stringify(bundle)) as Record<string, unknown>;
  for (const [key, value] of Object.entries(overrides)) setNestedValue(tree, key, value);
  return tree;
}

function localeInstance(lng: RouteLocale, translation: Record<string, unknown>): I18nInstance {
  const instance = createInstance();
  void instance.init({
    lng,
    fallbackLng: 'en',
    supportedLngs: [lng, 'en'],
    resources: { [lng]: { translation }, en: { translation: governedEnTranslation } },
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

export const localeInstances: Record<RouteLocale, I18nInstance> = {
  es: localeInstance('es', governed(esTranslation, GOVERNED_ES_OVERRIDES)),
  pt: localeInstance('pt', governed(ptTranslation, GOVERNED_PT_OVERRIDES)),
};

export function localeFromPath(pathname: string | null | undefined): RouteLocale | null {
  return ROUTE_LOCALES.find((locale) => pathname === `/${locale}` || Boolean(pathname?.startsWith(`/${locale}/`))) ?? null;
}
