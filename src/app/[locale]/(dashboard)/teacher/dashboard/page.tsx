import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getUnreadCount } from '@/lib/data/messages';
import { format, isToday } from 'date-fns';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TeacherDashboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('teacher.dashboard');
  const isRTL = locale === 'ar';

  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') redirect('/login');

  const userId = session.user.id;
  const userName = session.user.name?.split(' ')[0] || 'there';

  // Fetch real data
  const [pendingBookings, todayBookings, recentReviews, teacherProfile, unreadCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        teacherId: userId,
        status: 'pending',
      },
      include: {
        parent: true,
      },
      orderBy: { bookingDate: 'asc' },
      take: 3,
    }),
    prisma.booking.findMany({
      where: {
        teacherId: userId,
        status: 'confirmed',
        bookingDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: {
        parent: true,
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.review.findMany({
      where: { teacherId: userId },
      include: {
        parent: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
    }),
    prisma.teacherProfile.findUnique({
      where: { userId },
    }),
    getUnreadCount(userId),
  ]);

  // Calculate this month's earnings
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthlyEarnings = await prisma.booking.aggregate({
    where: {
      teacherId: userId,
      status: 'completed',
      bookingDate: { gte: startOfMonth },
    },
    _sum: { totalAmount: true },
  });

  const totalEarnings = await prisma.booking.aggregate({
    where: {
      teacherId: userId,
      status: 'completed',
    },
    _sum: { totalAmount: true },
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('welcome', { name: userName })}</h1>
          <p className="text-muted-foreground">
            You have {pendingBookings.length} pending booking request{pendingBookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/availability">
            <Calendar className="mr-2 h-4 w-4" />
            Manage Availability
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingBookings.length}</p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayBookings.length}</p>
              <p className="text-sm text-muted-foreground">Sessions Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Star className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teacherProfile?.ratingAvg?.toFixed(1) || '0.0'}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(monthlyEarnings._sum.totalAmount || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">EGP This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Booking Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('pendingBookings')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teacher/bookings">
                View All
                <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={booking.parent.avatarUrl || undefined} />
                      <AvatarFallback>{booking.parent.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.parent.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(booking.bookingDate, 'MMM d, yyyy')} | {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                </div>
                {booking.notes && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    &quot;{booking.notes}&quot;
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1" asChild>
                    <Link href="/teacher/bookings">
                      <CheckCircle className="h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {pendingBookings.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No pending requests
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('todaySchedule')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teacher/bookings">
                Full Schedule
                <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayBookings.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={session.parent.avatarUrl || undefined} />
                    <AvatarFallback>{session.parent.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.parent.fullName}</p>
                    <p className="text-sm text-muted-foreground">{session.startTime} - {session.endTime}</p>
                  </div>
                </div>
                <Badge variant="secondary">Confirmed</Badge>
              </div>
            ))}
            {todayBookings.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No sessions scheduled for today
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('recentReviews')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teacher/profile">
              View Profile
              <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {recentReviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{review.parent.fullName}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-secondary text-secondary'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    &quot;{review.comment}&quot;
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(review.createdAt, 'MMM d, yyyy')}
                </p>
              </div>
            ))}
            {recentReviews.length === 0 && (
              <div className="col-span-2 py-8 text-center text-muted-foreground">
                No reviews yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/messages"
              className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center transition-colors hover:bg-accent"
            >
              <MessageCircle className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Messages</p>
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
            </Link>
            <Link
              href="/teacher/availability"
              className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center transition-colors hover:bg-accent"
            >
              <Clock className="h-6 w-6 text-secondary" />
              <p className="text-sm font-medium">Availability</p>
              <p className="text-xs text-muted-foreground">Set your schedule</p>
            </Link>
            <Link
              href="/teacher/profile"
              className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center transition-colors hover:bg-accent"
            >
              <Star className="h-6 w-6 text-yellow-500" />
              <p className="text-sm font-medium">Profile</p>
              <p className="text-xs text-muted-foreground">{teacherProfile?.reviewCount || 0} reviews</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('earnings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{(monthlyEarnings._sum.totalAmount || 0).toLocaleString()} EGP</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">{(totalEarnings._sum.totalAmount || 0).toLocaleString()} EGP</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
