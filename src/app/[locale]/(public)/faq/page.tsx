import { Header, Footer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function FAQPage() {
  const t = useTranslations('faq');

  const faqCategories = [
    {
      key: 'general',
      questions: ['q1', 'q2', 'q3'],
    },
    {
      key: 'parents',
      questions: ['q1', 'q2', 'q3', 'q4'],
    },
    {
      key: 'teachers',
      questions: ['q1', 'q2', 'q3', 'q4'],
    },
    {
      key: 'centers',
      questions: ['q1', 'q2', 'q3'],
    },
    {
      key: 'community',
      questions: ['q1', 'q2', 'q3'],
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold">{t('title')}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {faqCategories.map((category) => (
              <div key={category.key}>
                <h2 className="mb-4 text-2xl font-semibold">
                  {t(`categories.${category.key}`)}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((qKey) => (
                    <Card key={qKey}>
                      <CardHeader className="cursor-pointer">
                        <CardTitle className="flex items-center justify-between text-lg">
                          {t(`${category.key}.${qKey}`)}
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {t(`${category.key}.a${qKey.slice(1)}`)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Card className="mt-12 bg-primary/5">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold">{t('stillQuestions')}</h3>
              <p className="mt-2 text-muted-foreground">
                {t('cantFind')}
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
                >
                  {t('contactSupport')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
