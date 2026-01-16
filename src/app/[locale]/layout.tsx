import type { Metadata } from 'next';
import { Poppins, Cairo, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeDirection, type Locale } from '@/i18n/config';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from '@/components/providers';
import { BetaBanner } from '@/components/layout';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo';
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
  metadataBase: new URL('https://liphant.co'),
  title: {
    default: 'Liphant - Where every child flourishes',
    template: '%s | Liphant',
  },
  description:
    'Connect with qualified shadow teachers and therapy centers to support your child with special needs in Egypt. Find ADHD specialists, autism therapists, speech therapy, and more.',
  keywords: [
    'shadow teacher',
    'shadow teacher Egypt',
    'special needs Egypt',
    'ADHD support Egypt',
    'autism therapy Egypt',
    'speech therapy Egypt',
    'occupational therapy',
    'child development',
    'therapy center Egypt',
    'special needs teacher',
    'معلم ظل',
    'احتياجات خاصة',
    'علاج التوحد',
    'علاج فرط الحركة',
  ],
  authors: [{ name: 'Liphant', url: 'https://liphant.co' }],
  creator: 'Liphant',
  publisher: 'Liphant',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    url: 'https://liphant.co',
    siteName: 'Liphant',
    title: 'Liphant - Where every child flourishes',
    description:
      'Connect with qualified shadow teachers and therapy centers to support your child with special needs in Egypt.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Liphant - Special Needs Support Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liphant - Where every child flourishes',
    description:
      'Connect with qualified shadow teachers and therapy centers to support your child with special needs in Egypt.',
    images: ['/og-image.png'],
    creator: '@liphant',
    site: '@liphant',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'healthcare',
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
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
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
