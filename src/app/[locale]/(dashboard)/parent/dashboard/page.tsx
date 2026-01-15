import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  MessageCircle,
  Search,
  Clock,
  ArrowRight,
  Star,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getUnreadCount } from '@/lib/data/messages';
import { format } from 'date-fns';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ParentDashboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('parent.dashboard');
  const isRTL = locale === 'ar';

  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = session.user.id;
  const userName = session.user.name?.split(' ')[0] || 'there';

  // Fetch real data
  const [bookings, unreadCount, recommendedTeachers] = await Promise.all([
    prisma.booking.findMany({
      where: {
        parentId: userId,
        status: { in: ['pending', 'confirmed'] },
      },
      include: {
        teacher: true,
      },
      orderBy: { bookingDate: 'asc' },
      take: 3,
    }),
    getUnreadCount(userId),
    prisma.user.findMany({
      where: {
        role: 'teacher',
        teacherProfile: {
          isAvailable: true,
          isVerified: true,
        },
      },
      include: {
        teacherProfile: true,
      },
      take: 2,
    }),
  ]);

  const totalBookings = await prisma.booking.count({
    where: { parentId: userId },
  });

  const upcomingCount = bookings.length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('welcome', { name: userName })}</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your sessions
          </p>
        </div>
        <Button asChild>
          <Link href="/teachers">
            <Search className="mr-2 h-4 w-4" />
            Find Teachers
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
              <p className="text-2xl font-bold">{upcomingCount}</p>
              <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBookings}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <MessageCircle className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recommendedTeachers.length}</p>
              <p className="text-sm text-muted-foreground">Available Teachers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('upcomingBookings')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/parent/bookings">
                View All
                <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={booking.teacher.avatarUrl || undefined} />
                    <AvatarFallback>{booking.teacher.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{booking.teacher.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(booking.bookingDate, 'MMM d, yyyy')} at {booking.startTime}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                >
                  {booking.status}
                </Badge>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No upcoming bookings
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('recentMessages')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/messages">
                View All
                <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/messages"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread messages` : 'No new messages'}
                </p>
              </div>
            </Link>
            <Link
              href="/teachers"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                <Search className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium">Find Teachers</p>
                <p className="text-sm text-muted-foreground">
                  Browse available shadow teachers
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Teachers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('recommendedTeachers')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teachers">
              Browse All
              <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendedTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={teacher.avatarUrl || undefined} />
                    <AvatarFallback>{teacher.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{teacher.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.teacherProfile?.specializations?.[0] || 'Shadow Teacher'}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      <span>{teacher.teacherProfile?.ratingAvg || 0}</span>
                      <span className="text-muted-foreground">
                        {teacher.teacherProfile?.hourlyRate || 0} EGP/hr
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/teachers/${teacher.id}`}>View</Link>
                </Button>
              </div>
            ))}
            {recommendedTeachers.length === 0 && (
              <div className="col-span-2 py-8 text-center text-muted-foreground">
                No teachers available at the moment
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
