import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingCard } from '@/components/booking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirect } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TeacherBookingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') redirect('/login');

  const bookings = await prisma.booking.findMany({
    where: { teacherId: session.user.id },
    include: {
      teacher: {
        include: { teacherProfile: true },
      },
      parent: true,
    },
    orderBy: { bookingDate: 'desc' },
  });

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Calendar className="h-6 w-6" />
          Bookings
        </h1>
        <p className="text-muted-foreground">
          Manage your session requests and schedule
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingBookings.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                viewAs="teacher"
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No pending requests</p>
              <p className="mt-1 text-sm">New booking requests will appear here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6 space-y-4">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                viewAs="teacher"
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No confirmed bookings
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6 space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                viewAs="teacher"
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No past bookings
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
