import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// Protected route prefixes that require authentication (dashboard pages)
// Note: /teachers (public search) and /centers (future) are NOT protected
const protectedPrefixes = [
  '/parent/',    // Parent dashboard pages
  '/teacher/',   // Teacher dashboard pages (note the trailing slash to not match /teachers)
  '/messages',   // Messages page
  '/settings',   // Settings page
];

// Auth routes - redirect to dashboard if logged in
const authPaths = ['/login', '/register'];

// Helper to check if path matches protected routes
function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix for checking
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');

  return protectedPrefixes.some((prefix) =>
    pathWithoutLocale.startsWith(prefix) || pathWithoutLocale === prefix.replace(/\/$/, '')
  );
}

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  // First handle i18n
  const response = intlMiddleware(req);

  // Check if path is protected (requires authentication)
  if (isProtectedRoute(pathname) && !session?.user) {
    const url = nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check if user is on auth page while logged in
  const isAuthPath = authPaths.some((path) => pathname.includes(path));

  if (isAuthPath && session?.user) {
    const url = nextUrl.clone();
    // Redirect based on role
    url.pathname = session.user.role === 'teacher'
      ? '/teacher/dashboard'
      : '/parent/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
});

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
