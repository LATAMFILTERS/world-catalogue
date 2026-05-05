import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Solo redirigir a raíz LATAM a español
  if (pathname === '/' && request.headers.get('cf-ipcountry') === 'VE') {
    const response = NextResponse.redirect('https://world-catalogue-production-a151.up.railway.app');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
