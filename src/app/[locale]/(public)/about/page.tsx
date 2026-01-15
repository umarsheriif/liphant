import { Header, Footer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Shield, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold md:text-5xl">{t('title')}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold">{t('mission.title')}</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('mission.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">{t('values.title')}</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">{t('values.compassion.title')}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {t('values.compassion.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">{t('values.trust.title')}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {t('values.trust.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">{t('values.community.title')}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {t('values.community.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">{t('values.excellence.title')}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {t('values.excellence.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold">{t('story.title')}</h2>
              <div className="mt-8 space-y-4 text-muted-foreground">
                <p>{t('story.p1')}</p>
                <p>{t('story.p2')}</p>
                <p>{t('story.p3')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 text-center md:grid-cols-4">
              <div>
                <div className="text-4xl font-bold">500+</div>
                <div className="mt-2 text-primary-foreground/80">{t('stats.teachers')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold">50+</div>
                <div className="mt-2 text-primary-foreground/80">{t('stats.centers')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold">2,000+</div>
                <div className="mt-2 text-primary-foreground/80">{t('stats.families')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold">10,000+</div>
                <div className="mt-2 text-primary-foreground/80">{t('stats.sessions')}</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
