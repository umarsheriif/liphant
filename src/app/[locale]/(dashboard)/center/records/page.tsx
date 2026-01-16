import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCenterSessionRecords, getCenterTeachersList } from '@/lib/data/session-records';
import { CenterRecordsClient } from './client';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    teacherId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>;
}

export default async function CenterRecordsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get center profile for this user
  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!centerProfile) {
    redirect('/center/dashboard');
  }

  const filters = await searchParams;

  const [records, teachers] = await Promise.all([
    getCenterSessionRecords(centerProfile.id, {
      teacherId: filters.teacherId,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      search: filters.search,
    }),
    getCenterTeachersList(centerProfile.id),
  ]);

  return (
    <CenterRecordsClient
      records={records}
      teachers={teachers}
      currentUserId={session.user.id}
      currentFilters={filters}
    />
  );
}
