import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Calendar, DollarSign, Star, TrendingUp } from 'lucide-react';

export default async function CenterAnalyticsPage() {
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
      reviews: true,
    },
  });

  const teacherUserIds = centerProfile?.teachers.map((t) => t.teacher.userId) || [];

  // Get bookings for analytics
  const bookings = await prisma.booking.findMany({
    where: {
      teacherId: { in: teacherUserIds },
    },
  });

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const avgRating = centerProfile?.reviews.length
    ? centerProfile.reviews.reduce((sum, r) => sum + r.rating, 0) / centerProfile.reviews.length
    : 0;

  // Monthly stats (simplified)
  const thisMonthBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.bookingDate);
    const now = new Date();
    return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
  });

  const thisMonthRevenue = thisMonthBookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Overview of your center&apos;s performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} EGP</div>
            <p className="text-xs text-muted-foreground">From {completedBookings.length} completed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthRevenue.toLocaleString()} EGP</div>
            <p className="text-xs text-muted-foreground">{thisMonthBookings.length} bookings this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">{completedBookings.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {avgRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">{centerProfile?.reviews.length || 0} reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teachers Performance</CardTitle>
            <CardDescription>Breakdown by teacher</CardDescription>
          </CardHeader>
          <CardContent>
            {centerProfile?.teachers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>No teachers in your center yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {centerProfile?.teachers.map((ct) => {
                  const teacherBookings = bookings.filter((b) => b.teacherId === ct.teacher.userId);
                  const teacherRevenue = teacherBookings
                    .filter((b) => b.status === 'completed')
                    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

                  return (
                    <div key={ct.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{ct.teacher.user.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {teacherBookings.length} sessions • {ct.teacher.ratingAvg.toFixed(1)} ⭐
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{teacherRevenue.toLocaleString()} EGP</p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest feedback from parents</CardDescription>
          </CardHeader>
          <CardContent>
            {!centerProfile?.reviews.length ? (
              <div className="py-8 text-center text-muted-foreground">
                <Star className="mx-auto h-12 w-12 mb-4" />
                <p>No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {centerProfile.reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Booking Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => {
              const count = bookings.filter((b) => b.status === status).length;
              const percentage = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
              const colors: Record<string, string> = {
                pending: 'bg-yellow-500',
                confirmed: 'bg-blue-500',
                completed: 'bg-green-500',
                cancelled: 'bg-red-500',
              };

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium">{status}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${colors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
