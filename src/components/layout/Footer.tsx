'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <Link href="/">
              <Logo variant="header" size="md" />
            </Link>
            <p className="text-sm text-muted-foreground">{t('aboutText')}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('quickLinks')}</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/teachers"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Find Teachers
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About Us
              </Link>
              <Link
                href="/register"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Join as Teacher
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('support')}</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/contact"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('contact')}
              </Link>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('faq')}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('terms')}
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          {t('copyright', { year: currentYear })}
        </div>
      </div>
    </footer>
  );
}
