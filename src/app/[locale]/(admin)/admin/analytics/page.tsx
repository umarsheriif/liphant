import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function AnalyticsPage() {
  // Get analytics data
  const [
    usersByRole,
    bookingsByStatus,
    monthlyUsers,
    topTeachers,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.teacherProfile.findMany({
      orderBy: { ratingAvg: 'desc' },
      take: 5,
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
      },
    }),
    prisma.booking.aggregate({
      where: { status: 'completed' },
      _sum: { totalAmount: true },
    }),
  ]);

  const roleStats = usersByRole.reduce(
    (acc, curr) => ({ ...acc, [curr.role]: curr._count.id }),
    {} as Record<string, number>
  );

  const bookingStats = bookingsByStatus.reduce(
    (acc, curr) => ({ ...acc, [curr.status]: curr._count.id }),
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Platform statistics and insights
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalRevenue._sum.totalAmount || 0).toLocaleString()} SAR
            </div>
            <p className="text-xs text-muted-foreground">
              From completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(roleStats).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {roleStats.parent || 0} parents, {roleStats.teacher || 0} teachers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(bookingStats).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingStats.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(bookingStats).reduce((a, b) => a + b, 0) > 0
                ? (
                    ((bookingStats.completed || 0) /
                      Object.values(bookingStats).reduce((a, b) => a + b, 0)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Bookings completed successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(roleStats).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="capitalize">{role.replace('_', ' ')}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bookings by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(bookingStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize">{status}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Rated Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topTeachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No teachers yet
              </p>
            ) : (
              <div className="space-y-4">
                {topTeachers.map((teacher, index) => (
                  <div key={teacher.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium">{teacher.user.fullName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{teacher.ratingAvg.toFixed(1)}</span>
                      <span className="text-muted-foreground"> / 5</span>
                      <p className="text-xs text-muted-foreground">
                        {teacher.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
