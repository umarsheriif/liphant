import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, AlertCircle, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { CenterBookingCard } from '@/components/center/CenterBookingCard';

export default async function CenterBookingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'center_admin') {
    redirect('/login');
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      centerTeachers: {
        where: { isActive: true },
        include: {
          teacher: {
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
              availabilities: true,
            },
          },
        },
      },
    },
  });

  if (!centerProfile) {
    redirect('/center/profile');
  }

  // Get all teacher user IDs associated with this center
  const teacherUserIds = centerProfile.centerTeachers.map((t) => t.teacher.userId);

  // Fetch all bookings: both direct teacher bookings and center service bookings
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        // Center service bookings (booked to the center directly)
        { centerId: centerProfile.id },
        // Direct teacher bookings (teacher works at this center)
        { teacherId: { in: teacherUserIds } },
      ],
    },
    include: {
      parent: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      teacher: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      service: {
        select: { id: true, nameEn: true, price: true, duration: true },
      },
    },
    orderBy: { bookingDate: 'desc' },
  });

  // Categorize bookings
  const awaitingAssignmentBookings = bookings.filter((b) => b.status === 'awaiting_assignment');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  // Prepare teachers list for assignment dropdown
  const availableTeachers = centerProfile.centerTeachers.map((ct) => ({
    id: ct.teacher.id,
    userId: ct.teacher.userId,
    fullName: ct.teacher.user.fullName,
    avatarUrl: ct.teacher.user.avatarUrl,
    availabilityCount: ct.teacher.availabilities.length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">
          Manage bookings for your center and assign teachers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card className={awaitingAssignmentBookings.length > 0 ? 'border-amber-500' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              {awaitingAssignmentBookings.length > 0 && (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              Awaiting Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {awaitingAssignmentBookings.length}
            </div>
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

      <Tabs defaultValue={awaitingAssignmentBookings.length > 0 ? 'awaiting' : 'all'}>
        <TabsList>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="awaiting" className="relative">
            Awaiting ({awaitingAssignmentBookings.length})
            {awaitingAssignmentBookings.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </TabsTrigger>
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
                  <p className="text-muted-foreground">
                    Bookings will appear here once parents book sessions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <CenterBookingCard
                      key={booking.id}
                      booking={booking}
                      teachers={availableTeachers}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awaiting" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Awaiting Teacher Assignment
              </CardTitle>
              <CardDescription>
                These bookings need a teacher assigned. Select an available teacher for each booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {awaitingAssignmentBookings.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No bookings awaiting assignment
                </p>
              ) : (
                <div className="space-y-4">
                  {awaitingAssignmentBookings.map((booking) => (
                    <CenterBookingCard
                      key={booking.id}
                      booking={booking}
                      teachers={availableTeachers}
                      showAssignment
                    />
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
                <p className="py-8 text-center text-muted-foreground">No pending bookings</p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <CenterBookingCard
                      key={booking.id}
                      booking={booking}
                      teachers={availableTeachers}
                    />
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
                <p className="py-8 text-center text-muted-foreground">No confirmed bookings</p>
              ) : (
                <div className="space-y-4">
                  {confirmedBookings.map((booking) => (
                    <CenterBookingCard
                      key={booking.id}
                      booking={booking}
                      teachers={availableTeachers}
                    />
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
                <p className="py-8 text-center text-muted-foreground">No completed bookings</p>
              ) : (
                <div className="space-y-4">
                  {completedBookings.map((booking) => (
                    <CenterBookingCard
                      key={booking.id}
                      booking={booking}
                      teachers={availableTeachers}
                    />
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
