import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { getBookingWithRecords } from '@/lib/data/session-records';
import { BookingDetailClient } from './client';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const booking = await getBookingWithRecords(id, session.user.id);

  if (!booking) {
    notFound();
  }

  // Check if user has access to this booking
  const isParent = booking.parentId === session.user.id;
  const isTeacher = booking.teacherId === session.user.id;

  if (!isParent && !isTeacher) {
    // Check if user is a center admin for this teacher
    // This would require additional center check logic
    notFound();
  }

  return (
    <BookingDetailClient
      booking={booking}
      currentUserId={session.user.id}
      viewAs={isTeacher ? 'teacher' : 'parent'}
    />
  );
}
