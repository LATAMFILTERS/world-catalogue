'use client';

// ELIMFILTERS public language policy.
// English is the official/default language. A supported localized language is
// selected only from the visitor's country. Unknown countries and any lookup
// failure remain in English.
const COUNTRY_LANG: Record<string, string> = {
  // English
  US: 'en', CA: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  SG: 'en', PH: 'en', IN: 'en', NG: 'en', GH: 'en', KE: 'en', UG: 'en',
  TZ: 'en', ZM: 'en', ZW: 'en', JM: 'en', TT: 'en', BS: 'en', BB: 'en',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CL: 'es', CO: 'es', PE: 'es', VE: 'es',
  EC: 'es', BO: 'es', PY: 'es', UY: 'es', DO: 'es', GT: 'es', HN: 'es',
  SV: 'es', NI: 'es', CR: 'es', PA: 'es', CU: 'es', PR: 'es', GQ: 'es',
  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', ST: 'pt', TL: 'pt', GW: 'pt',
  // French
  FR: 'fr', LU: 'fr', MC: 'fr', CI: 'fr', SN: 'fr', ML: 'fr', GN: 'fr',
  BF: 'fr', NE: 'fr', TD: 'fr', CM: 'fr', CG: 'fr', CD: 'fr', MG: 'fr',
  HT: 'fr', CH: 'fr', BE: 'fr',
  // Italian
  IT: 'it', SM: 'it', VA: 'it',
  // Dutch
  NL: 'nl', SR: 'nl', AW: 'nl', CW: 'nl',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', TJ: 'ru', UZ: 'ru',
  AM: 'ru', AZ: 'ru', GE: 'ru', UA: 'ru', MD: 'ru',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  // Japanese
  JP: 'ja',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', JO: 'ar', LB: 'ar', SY: 'ar', IQ: 'ar',
  KW: 'ar', BH: 'ar', QA: 'ar', OM: 'ar', YE: 'ar', LY: 'ar', SD: 'ar',
  MA: 'ar', DZ: 'ar', TN: 'ar', MR: 'ar',
  // Persian
  IR: 'fa',
};

const GEO_LANG_KEY = 'ef_geo_lang';
const GEO_COUNTRY_KEY = 'ef_geo_country';
const GEO_TS_KEY = 'ef_geo_ts';
const TTL = 7 * 24 * 60 * 60 * 1000;
const OFFICIAL_LANGUAGE = 'en';
const OFFICIAL_COUNTRY = 'US';
const GEO_ENDPOINT = 'https://ipwho.is/?fields=success,country_code';

export interface GeoResult {
  language: string;
  country: string;
  showSwitcher: boolean;
}

function officialDefault(): GeoResult {
  return { language: OFFICIAL_LANGUAGE, country: OFFICIAL_COUNTRY, showSwitcher: false };
}

export async function detectGeoLanguage(): Promise<GeoResult> {
  if (typeof window === 'undefined') return officialDefault();

  const ts = localStorage.getItem(GEO_TS_KEY);
  const cachedLang = localStorage.getItem(GEO_LANG_KEY);
  const cachedCountry = localStorage.getItem(GEO_COUNTRY_KEY);
  const parsedTs = ts ? Number.parseInt(ts, 10) : Number.NaN;

  if (
    Number.isFinite(parsedTs) &&
    cachedLang &&
    cachedCountry &&
    Date.now() - parsedTs < TTL
  ) {
    return { language: cachedLang, country: cachedCountry, showSwitcher: false };
  }

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    const res = await fetch(GEO_ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    window.clearTimeout(timeout);

    if (!res.ok) return officialDefault();

    const data = await res.json() as { success?: boolean; country_code?: string };
    if (data.success === false) return officialDefault();

    const country = String(data.country_code || OFFICIAL_COUNTRY).toUpperCase();
    const language = COUNTRY_LANG[country] || OFFICIAL_LANGUAGE;

    localStorage.setItem(GEO_LANG_KEY, language);
    localStorage.setItem(GEO_COUNTRY_KEY, country);
    localStorage.setItem(GEO_TS_KEY, String(Date.now()));

    return { language, country, showSwitcher: false };
  } catch {
    return officialDefault();
  }
}

export { COUNTRY_LANG, OFFICIAL_LANGUAGE };
