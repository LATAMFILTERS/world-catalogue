import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();
  const email = request.headers.get('cf-access-authenticated-user-email') ?? request.headers.get('x-authenticated-user-email');
  const jwt = request.headers.get('cf-access-jwt-assertion') ?? request.headers.get('x-authenticated-user-token');
  if (!email || !jwt) return new NextResponse('Unauthorized', { status: 401 });
  const response = NextResponse.next();
  response.headers.set('x-review-user', email);
  response.headers.set('cache-control', 'no-store');
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
