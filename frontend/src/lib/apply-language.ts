'use client';

import i18n from '@/i18n';
import type { SiteLang } from '@/lib/language-preference';
import type { i18n as I18nInstance } from 'i18next';

/**
 * Translate the current English-URL page in place (client-side i18n) for pages that have no
 * published /es/ or /pt/ version. The bundle is loaded first so the page never renders half
 * English, half translated.
 */
export async function applyLanguageInPlace(lang: SiteLang, instance: I18nInstance = i18n): Promise<void> {
  try {
    await instance.loadLanguages(lang);
    await instance.changeLanguage(lang);
  } catch {
    if (lang !== 'en') await instance.changeLanguage('en');
  }
}
