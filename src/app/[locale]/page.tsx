import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header, Footer } from '@/components/layout';
import { BlobDecoration, WaveDivider, FloatingDots } from '@/components/decorative';
import {
  Search,
  MessageCircle,
  Calendar,
  Shield,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Heart,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');
  const isRTL = locale === 'ar';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24 lg:py-32">
          {/* Decorative blobs */}
          <BlobDecoration
            variant="primary"
            size="xl"
            className="top-0 -right-32 md:-right-20"
          />
          <BlobDecoration
            variant="secondary"
            size="lg"
            className="-bottom-20 -left-20"
          />
          <BlobDecoration
            variant="accent"
            size="md"
            className="top-1/2 -left-10 hidden lg:block"
          />

          {/* Floating dots */}
          <FloatingDots count={7} />

          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Text content */}
              <div className={`text-center lg:text-${isRTL ? 'right' : 'left'}`}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Supporting special needs families in Egypt</span>
                </div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {t('hero.title')}
                </h1>
                <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                  {t('hero.subtitle')}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <Button size="lg" asChild className="gap-2">
                    <Link href="/teachers">
                      {t('hero.ctaParent')}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/register?role=teacher">{t('hero.ctaTeacher')}</Link>
                  </Button>
                </div>
              </div>

              {/* Hero illustration */}
              <div className="relative hidden lg:block">
                <div className="relative mx-auto w-full max-w-md">
                  <Image
                    src="/illustrations/hero-family.svg"
                    alt="Happy family with child"
                    width={500}
                    height={400}
                    className="w-full h-auto drop-shadow-xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <WaveDivider variant="background" />
        </section>

        {/* How It Works */}
        <section className="relative py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <Heart className="h-4 w-4" />
                Simple & Easy
              </span>
              <h2 className="text-3xl font-bold md:text-4xl">
                {t('howItWorks.title')}
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Search,
                  illustration: '/illustrations/step-search.svg',
                  title: t('howItWorks.step1.title'),
                  description: t('howItWorks.step1.description'),
                  step: '01',
                  color: 'primary',
                },
                {
                  icon: MessageCircle,
                  illustration: '/illustrations/step-connect.svg',
                  title: t('howItWorks.step2.title'),
                  description: t('howItWorks.step2.description'),
                  step: '02',
                  color: 'secondary',
                },
                {
                  icon: Calendar,
                  illustration: '/illustrations/step-book.svg',
                  title: t('howItWorks.step3.title'),
                  description: t('howItWorks.step3.description'),
                  step: '03',
                  color: 'accent',
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="absolute -top-4 right-4 text-6xl font-bold text-primary/10">
                      {item.step}
                    </div>
                    {/* Step illustration */}
                    <div className="mb-4 flex justify-center">
                      <Image
                        src={item.illustration}
                        alt={item.title}
                        width={120}
                        height={120}
                        className="h-24 w-24 object-contain"
                      />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-center">{item.title}</h3>
                    <p className="text-muted-foreground text-center">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative bg-muted/50 py-20">
          <WaveDivider variant="muted" flip />
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-accent">
                <Sparkles className="h-4 w-4" />
                Why Choose Us
              </span>
              <h2 className="text-3xl font-bold md:text-4xl">
                {t('features.title')}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Shield,
                  title: t('features.verified.title'),
                  description: t('features.verified.description'),
                  color: 'bg-primary/10 text-primary',
                  hoverBorder: 'hover:border-primary/50',
                },
                {
                  icon: Star,
                  title: t('features.reviews.title'),
                  description: t('features.reviews.description'),
                  color: 'bg-secondary/30 text-secondary-foreground',
                  hoverBorder: 'hover:border-secondary/50',
                },
                {
                  icon: Users,
                  title: t('features.community.title'),
                  description: t('features.community.description'),
                  color: 'bg-accent/10 text-accent',
                  hoverBorder: 'hover:border-accent/50',
                },
                {
                  icon: Calendar,
                  title: t('features.easy.title'),
                  description: t('features.easy.description'),
                  color: 'bg-primary/10 text-primary',
                  hoverBorder: 'hover:border-primary/50',
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className={`border-2 border-transparent bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${feature.hoverBorder}`}
                >
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Specializations */}
        <section className="relative py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <Heart className="h-4 w-4" />
                Comprehensive Care
              </span>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Support for Every Need
              </h2>
              <p className="mb-8 text-muted-foreground">
                Our network of professionals specializes in a wide range of areas
              </p>
            </div>
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
              {[
                { name: 'ADHD', color: 'bg-primary/10 border-primary/20' },
                { name: 'Autism Spectrum', color: 'bg-accent/10 border-accent/20' },
                { name: 'Speech Therapy', color: 'bg-secondary/30 border-secondary/30' },
                { name: 'Occupational Therapy', color: 'bg-primary/10 border-primary/20' },
                { name: 'Behavioral Therapy', color: 'bg-accent/10 border-accent/20' },
                { name: 'Learning Disabilities', color: 'bg-secondary/30 border-secondary/30' },
                { name: 'Sensory Processing', color: 'bg-primary/10 border-primary/20' },
                { name: 'Developmental Delays', color: 'bg-accent/10 border-accent/20' },
                { name: 'Social Skills', color: 'bg-secondary/30 border-secondary/30' },
              ].map((spec) => (
                <span
                  key={spec.name}
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-transform hover:scale-105 ${spec.color}`}
                >
                  <CheckCircle className="h-4 w-4 text-accent" />
                  {spec.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
          <WaveDivider variant="primary" flip />

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-white/5" />
          <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-1/4 h-16 w-16 rounded-full bg-white/5" />

          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* CTA illustration */}
              <div className="hidden lg:block">
                <Image
                  src="/illustrations/cta-family.svg"
                  alt="Happy family celebrating"
                  width={400}
                  height={300}
                  className="w-full max-w-sm mx-auto drop-shadow-2xl"
                />
              </div>

              {/* CTA content */}
              <div className={`text-center lg:text-${isRTL ? 'right' : 'left'}`}>
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  {t('cta.title')}
                </h2>
                <p className="mb-8 text-primary-foreground/80 text-lg">
                  {t('cta.subtitle')}
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href="/register">
                    {t('cta.button')}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
