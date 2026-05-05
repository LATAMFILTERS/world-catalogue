import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  const country = request.headers.get('cf-ipcountry') || '';
  const countryToLang = {
    'MX': 'es', 'AR': 'es', 'CL': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'EC': 'es', 'BO': 'es', 'PY': 'es', 'UY': 'es', 'GT': 'es', 'HN': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es', 'CU': 'es', 'DO': 'es', 'PR': 'es', 'ES': 'es',
    'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en', 'IN': 'en', 'SG': 'en', 'MY': 'en', 'PH': 'en', 'HK': 'en',
    'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'DE': 'de', 'AT': 'de', 'PT': 'pt', 'BR': 'pt', 'IT': 'it', 'NL': 'nl',
  };
  const lang = countryToLang[country] || 'en';
  const langUrls = {
    'es': 'https://world-catalogue-production-a151.up.railway.app',
    'en': 'https://part-search.elimfilters.com',
    'fr': 'https://part-search.elimfilters.com',
    'de': 'https://part-search.elimfilters.com',
    'pt': 'https://part-search.elimfilters.com',
    'it': 'https://part-search.elimfilters.com',
    'nl': 'https://part-search.elimfilters.com',
  };
  if (pathname === '/' || pathname === '') {
    const targetUrl = langUrls[lang];
    const response = NextResponse.redirect(targetUrl);
    response.cookies.set('preferred-lang', lang, { maxAge: 31536000, path: '/' });
    response.cookies.set('user-country', country, { maxAge: 31536000, path: '/' });
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
