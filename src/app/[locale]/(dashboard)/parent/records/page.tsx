import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { getParentSessionRecords, getParentTeachers } from '@/lib/data/session-records';
import { ParentRecordsClient } from './client';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    teacherId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>;
}

export default async function ParentRecordsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const filters = await searchParams;

  const [records, teachers] = await Promise.all([
    getParentSessionRecords(session.user.id, {
      teacherId: filters.teacherId,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      search: filters.search,
    }),
    getParentTeachers(session.user.id),
  ]);

  return (
    <ParentRecordsClient
      records={records}
      teachers={teachers}
      currentUserId={session.user.id}
      currentFilters={filters}
    />
  );
}
