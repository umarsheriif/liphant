import { Header, Footer } from '@/components/layout';
import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <>
      <Header />
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">{t('lastUpdated')}</p>

            <div className="mt-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold">{t('sections.acceptance.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.acceptance.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.description.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.description.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.accounts.title')}</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>{t('sections.accounts.intro')}</p>
                  <ul className="ms-6 list-disc space-y-1">
                    <li>{t('sections.accounts.accurate')}</li>
                    <li>{t('sections.accounts.security')}</li>
                    <li>{t('sections.accounts.notify')}</li>
                    <li>{t('sections.accounts.responsible')}</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.providers.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.providers.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.bookings.title')}</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>{t('sections.bookings.intro')}</p>
                  <ul className="ms-6 list-disc space-y-1">
                    <li>{t('sections.bookings.secure')}</li>
                    <li>{t('sections.bookings.cancellation')}</li>
                    <li>{t('sections.bookings.fee')}</li>
                    <li>{t('sections.bookings.refunds')}</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.conduct.title')}</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>{t('sections.conduct.intro')}</p>
                  <ul className="ms-6 list-disc space-y-1">
                    <li>{t('sections.conduct.unlawful')}</li>
                    <li>{t('sections.conduct.harass')}</li>
                    <li>{t('sections.conduct.false')}</li>
                    <li>{t('sections.conduct.circumvent')}</li>
                    <li>{t('sections.conduct.violate')}</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.ip.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.ip.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.liability.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.liability.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.changes.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.changes.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.contact.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.contact.content')}
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
