import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header, Footer } from '@/components/layout';
import { TeacherCard, TeacherFilters } from '@/components/teachers';
import { getTeachers, getAvailableCities } from '@/lib/data/teachers';
import type { Specialization } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Find Shadow Teachers & Therapists',
  description:
    'Browse verified shadow teachers and therapists in Egypt. Find specialists in ADHD, autism, speech therapy, occupational therapy, and more. Book sessions online.',
  keywords: [
    'shadow teacher Egypt',
    'find therapist Egypt',
    'ADHD specialist',
    'autism therapist',
    'speech therapist Egypt',
    'occupational therapist',
    'special needs teacher',
  ],
  openGraph: {
    title: 'Find Shadow Teachers & Therapists | Liphant',
    description:
      'Browse verified shadow teachers and therapists in Egypt. Find specialists in ADHD, autism, speech therapy, and more.',
    url: '/teachers',
  },
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    city?: string;
    specialization?: string;
    minRating?: string;
    maxRate?: string;
    page?: string;
  }>;
}

export default async function TeachersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('teacher.search');

  // Parse filters
  const specializations = filters.specialization
    ? [filters.specialization as Specialization]
    : undefined;
  const minRating = filters.minRating ? parseFloat(filters.minRating) : undefined;
  const maxRate = filters.maxRate ? parseInt(filters.maxRate) : undefined;

  // Fetch teachers from database
  const teachers = await getTeachers({
    search: filters.q,
    city: filters.city,
    specializations,
    minRating,
    maxRate,
  });

  // Get available cities for filter dropdown
  const cities = await getAvailableCities();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('results', { count: teachers.length })}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <TeacherFilters
              initialFilters={{
                query: filters.q,
                city: filters.city,
                specialization: filters.specialization,
                minRating: filters.minRating,
                maxRate: filters.maxRate,
              }}
              cities={cities}
            />
          </div>

          {/* Results */}
          {teachers.length > 0 ? (
            <div className="grid gap-6">
              {teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">{t('noResults')}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
