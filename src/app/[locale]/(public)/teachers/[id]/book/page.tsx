import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getTeacherById } from '@/lib/data/teachers';
import { BookingForm } from '@/components/booking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react';
import { createBooking, getTeacherAvailability } from './actions';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function BookTeacherPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/teachers/${id}/book`);
  }

  if (session.user.role !== 'parent') {
    redirect('/teacher/dashboard');
  }

  // Get teacher
  const teacher = await getTeacherById(id);

  if (!teacher) {
    notFound();
  }

  // Create bound action for getting availability
  const getAvailabilityAction = async (dateStr: string) => {
    'use server';
    return getTeacherAvailability(id, dateStr);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container py-4">
          <Link href={`/teachers/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          {/* Teacher Info */}
          <div className="mb-8 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={teacher.user.avatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {teacher.user.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{teacher.user.fullName}</h1>
                {teacher.isVerified && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                {teacher.ratingAvg > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{teacher.ratingAvg.toFixed(1)}</span>
                    <span>({teacher.reviewCount} reviews)</span>
                  </div>
                )}
                <Badge variant="secondary">{teacher.hourlyRate} EGP/hour</Badge>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <BookingForm
            teacherId={id}
            teacherUserId={teacher.userId}
            teacherName={teacher.user.fullName}
            hourlyRate={teacher.hourlyRate}
            createBookingAction={createBooking}
            getAvailabilityAction={getAvailabilityAction}
          />
        </div>
      </div>
    </div>
  );
}
