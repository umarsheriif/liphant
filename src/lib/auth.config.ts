import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@prisma/client';

// Auth config without Prisma - safe for Edge Runtime (middleware)
export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [], // Providers are added in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const session = auth;
      const pathname = nextUrl.pathname;

      // Remove locale prefix for checking
      const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');

      // Protected route prefixes
      const protectedPrefixes = [
        '/parent/',
        '/teacher/',
        '/center/',
        '/admin',
        '/messages',
        '/settings',
      ];

      // Community write routes
      const communityWriteRoutes = [
        '/community/events/create',
        '/community/forum/new',
      ];

      // Check if protected
      const isProtected =
        protectedPrefixes.some(prefix =>
          pathWithoutLocale.startsWith(prefix) || pathWithoutLocale === prefix.replace(/\/$/, '')
        ) ||
        communityWriteRoutes.some(route => pathWithoutLocale.startsWith(route)) ||
        /^\/community\/forum\/[^/]+\/new/.test(pathWithoutLocale);

      // Check admin routes
      const isAdminRoute = pathWithoutLocale.startsWith('/admin');

      // Auth pages
      const isAuthPage = ['/login', '/register'].some(path => pathWithoutLocale.includes(path));

      // If on auth page and logged in, allow (redirect handled in middleware)
      if (isAuthPage && session?.user) {
        return true;
      }

      // If protected and not logged in, deny
      if (isProtected && !session?.user) {
        return false;
      }

      // If admin route and not admin, deny
      if (isAdminRoute && session?.user?.role !== 'admin') {
        return false;
      }

      return true;
    },
  },
};
