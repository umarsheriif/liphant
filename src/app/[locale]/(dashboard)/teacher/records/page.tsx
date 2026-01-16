import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { getTeacherSessionRecords, getTeacherParents } from '@/lib/data/session-records';
import { TeacherRecordsClient } from './client';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    parentId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>;
}

export default async function TeacherRecordsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const filters = await searchParams;

  const [records, parents] = await Promise.all([
    getTeacherSessionRecords(session.user.id, {
      parentId: filters.parentId,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      search: filters.search,
    }),
    getTeacherParents(session.user.id),
  ]);

  return (
    <TeacherRecordsClient
      records={records}
      parents={parents}
      currentUserId={session.user.id}
      currentFilters={filters}
    />
  );
}
