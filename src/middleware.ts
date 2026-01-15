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
// Note: /teachers, /centers, and /community (public listings/viewing) are NOT protected
const protectedPrefixes = [
  '/parent/',    // Parent dashboard pages
  '/teacher/',   // Teacher dashboard pages (note the trailing slash to not match /teachers)
  '/center/',    // Center dashboard pages (note the trailing slash to not match /centers)
  '/admin',      // Admin dashboard
  '/messages',   // Messages page
  '/settings',   // Settings page
];

// Community write routes that require authentication (creating events, posts, etc.)
const communityWriteRoutes = [
  '/community/events/create',
  '/community/forum/new',
];

// Admin-only routes
const adminPaths = ['/admin'];

// Auth routes - redirect to dashboard if logged in
const authPaths = ['/login', '/register'];

// Helper to check if path matches protected routes
function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix for checking
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');

  // Check dashboard protected routes
  if (protectedPrefixes.some((prefix) =>
    pathWithoutLocale.startsWith(prefix) || pathWithoutLocale === prefix.replace(/\/$/, '')
  )) {
    return true;
  }

  // Check community write routes (create event, new post)
  if (communityWriteRoutes.some((route) => pathWithoutLocale.startsWith(route))) {
    return true;
  }

  // Check for new post routes like /community/forum/[categorySlug]/new
  if (/^\/community\/forum\/[^/]+\/new/.test(pathWithoutLocale)) {
    return true;
  }

  return false;
}

// Helper to check if path is admin-only
function isAdminRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');
  return adminPaths.some((prefix) => pathWithoutLocale.startsWith(prefix));
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

  // Check admin routes - only admin role can access
  if (isAdminRoute(pathname) && session?.user?.role !== 'admin') {
    const url = nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Check if user is on auth page while logged in
  const isAuthPath = authPaths.some((path) => pathname.includes(path));

  if (isAuthPath && session?.user) {
    const url = nextUrl.clone();
    // Redirect based on role
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

  return response;
});

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
