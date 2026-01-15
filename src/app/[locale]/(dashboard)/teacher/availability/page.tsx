import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AvailabilityManager } from '@/components/booking';
import { redirect } from 'next/navigation';
import { Clock } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TeacherAvailabilityPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') redirect('/login');

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacherProfile) redirect('/teacher/profile');

  const availabilities = await prisma.availability.findMany({
    where: { teacherId: teacherProfile.id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Clock className="h-6 w-6" />
          Availability
        </h1>
        <p className="text-muted-foreground">
          Set your weekly availability for parents to book sessions
        </p>
      </div>

      <AvailabilityManager availabilities={availabilities} />
    </div>
  );
}
