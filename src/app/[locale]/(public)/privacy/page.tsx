import { Header, Footer } from '@/components/layout';
import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

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
                <h2 className="text-2xl font-semibold">{t('sections.collect.title')}</h2>
                <div className="mt-4 space-y-4 text-muted-foreground">
                  <p><strong>{t('sections.collect.personal')}</strong></p>
                  <p><strong>{t('sections.collect.profile')}</strong></p>
                  <p><strong>{t('sections.collect.usage')}</strong></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.use.title')}</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>{t('sections.use.intro')}</p>
                  <ul className="ms-6 list-disc space-y-1">
                    <li>{t('sections.use.items.provide')}</li>
                    <li>{t('sections.use.items.connect')}</li>
                    <li>{t('sections.use.items.process')}</li>
                    <li>{t('sections.use.items.send')}</li>
                    <li>{t('sections.use.items.ensure')}</li>
                    <li>{t('sections.use.items.comply')}</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.sharing.title')}</h2>
                <div className="mt-4 space-y-4 text-muted-foreground">
                  <p>{t('sections.sharing.intro')}</p>
                  <ul className="ms-6 list-disc space-y-1">
                    <li><strong>{t('sections.sharing.users')}</strong></li>
                    <li><strong>{t('sections.sharing.providers')}</strong></li>
                    <li><strong>{t('sections.sharing.legal')}</strong></li>
                  </ul>
                  <p>{t('sections.sharing.noSell')}</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.security.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.security.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.rights.title')}</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>{t('sections.rights.intro')}</p>
                  <ul className="ms-6 list-disc space-y-1">
                    <li>{t('sections.rights.access')}</li>
                    <li>{t('sections.rights.correct')}</li>
                    <li>{t('sections.rights.delete')}</li>
                    <li>{t('sections.rights.export')}</li>
                    <li>{t('sections.rights.optout')}</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.children.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.children.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.cookies.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.cookies.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.retention.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.retention.content')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">{t('sections.transfers.title')}</h2>
                <p className="mt-4 text-muted-foreground">
                  {t('sections.transfers.content')}
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
