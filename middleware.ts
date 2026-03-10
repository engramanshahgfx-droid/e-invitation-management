import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

// Pages accessible without authentication
const publicPages = [
  '/',
  '/auth/login',
  '/auth/register',
  '/pricing',
  '/demo-preview',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Redirect root to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|ar)/:path*']
};