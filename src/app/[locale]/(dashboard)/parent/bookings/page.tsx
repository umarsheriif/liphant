import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingCard } from '@/components/booking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirect } from 'next/navigation';
import { Calendar } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ParentBookingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/login');

  const bookings = await prisma.booking.findMany({
    where: { parentId: session.user.id },
    include: {
      teacher: {
        include: { teacherProfile: true },
      },
      parent: true,
    },
    orderBy: { bookingDate: 'desc' },
  });

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Calendar className="h-6 w-6" />
          My Bookings
        </h1>
        <p className="text-muted-foreground">
          View and manage your session bookings
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                viewAs="parent"
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No upcoming bookings</p>
              <p className="mt-1 text-sm">Browse teachers to book your first session</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6 space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                viewAs="parent"
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
