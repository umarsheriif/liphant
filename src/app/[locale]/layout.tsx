import type { Metadata } from 'next';
import { Poppins, Cairo, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeDirection, type Locale } from '@/i18n/config';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from '@/components/providers';
import { BetaBanner } from '@/components/layout';
import '../globals.css';

// Poppins - Primary font for English (as per brand guidelines)
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// JetBrains Mono - Monospace font for code
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

// Cairo - Arabic font
const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Liphant - Where every child flourishes',
    template: '%s | Liphant',
  },
  description:
    'Connect with qualified shadow teachers and therapy centers to support your child with special needs in Egypt.',
  keywords: [
    'shadow teacher',
    'special needs',
    'ADHD',
    'autism',
    'therapy',
    'Egypt',
    'child development',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const direction = localeDirection[locale as Locale];
  const fontClass =
    locale === 'ar'
      ? `${cairo.variable} ${jetbrainsMono.variable}`
      : `${poppins.variable} ${jetbrainsMono.variable}`;

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${fontClass} antialiased`}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <BetaBanner />
            {children}
            <Toaster position={direction === 'rtl' ? 'top-left' : 'top-right'} />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
