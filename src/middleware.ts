import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';
import { authConfig } from '@/lib/auth.config';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  // Remove locale prefix for checking
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');

  // Auth pages - redirect to dashboard if logged in
  const isAuthPage = ['/login', '/register'].some(path => pathWithoutLocale.includes(path));

  if (isAuthPage && session?.user) {
    const url = nextUrl.clone();
    switch (session.user.role) {
      case 'admin':
        url.pathname = '/admin';
        break;
      case 'teacher':
        url.pathname = '/teacher/dashboard';
        break;
      case 'center_admin':
        url.pathname = '/center/dashboard';
        break;
      default:
        url.pathname = '/parent/dashboard';
    }
    return NextResponse.redirect(url);
  }

  // Handle i18n
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
