'use client';

import i18n from '@/i18n';
import type { SiteLang } from '@/lib/language-preference';

/**
 * Translate the current English-URL page in place (client-side i18n) for pages that have no
 * published /es/ or /pt/ version. The bundle is loaded first so the page never renders half
 * English, half translated.
 */
export async function applyLanguageInPlace(lang: SiteLang): Promise<void> {
  try {
    await i18n.loadLanguages(lang);
    await i18n.changeLanguage(lang);
  } catch {
    if (lang !== 'en') await i18n.changeLanguage('en');
  }
}
