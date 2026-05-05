import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Solo redirigir en la raíz
  if (pathname === '/') {
    const country = request.headers.get('cf-ipcountry') || '';

    // Países LATAM que van a ESPAÑOL
    const latinAmerica = ['MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR', 'ES'];

    if (latinAmerica.includes(country)) {
      const response = NextResponse.redirect('https://world-catalogue-production-a151.up.railway.app');
      response.cookies.set('lang', 'es', { maxAge: 31536000, path: '/' });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
