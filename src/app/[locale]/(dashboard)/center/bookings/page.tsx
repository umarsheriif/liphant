import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default async function CenterBookingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'center_admin') {
    redirect('/login');
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      teachers: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  // Get all teacher IDs associated with this center
  const teacherUserIds = centerProfile?.teachers.map((t) => t.teacher.userId) || [];

  // Fetch bookings for all teachers in this center
  const bookings = await prisma.booking.findMany({
    where: {
      teacherId: { in: teacherUserIds },
    },
    include: {
      parent: true,
      teacher: {
        include: {
          teacherProfile: true,
        },
      },
    },
    orderBy: { bookingDate: 'desc' },
  });

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const BookingCard = ({ booking }: { booking: typeof bookings[0] }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{booking.parent.fullName}</span>
          <span className="text-muted-foreground">with</span>
          <span className="font-medium">{booking.teacher.fullName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
        {booking.notes && (
          <p className="text-sm text-muted-foreground">{booking.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant={
            booking.status === 'confirmed'
              ? 'default'
              : booking.status === 'pending'
              ? 'secondary'
              : booking.status === 'completed'
              ? 'outline'
              : 'destructive'
          }
        >
          {booking.status}
        </Badge>
        <span className="font-semibold text-primary">{booking.totalAmount} EGP</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">View all bookings for your center&apos;s teachers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{confirmedBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>View all bookings across your center</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="py-10 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
                  <p className="text-muted-foreground">Bookings will appear here once parents book sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {pendingBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending bookings</p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {confirmedBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No confirmed bookings</p>
              ) : (
                <div className="space-y-4">
                  {confirmedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {completedBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No completed bookings</p>
              ) : (
                <div className="space-y-4">
                  {completedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
