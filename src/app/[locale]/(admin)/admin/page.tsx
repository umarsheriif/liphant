import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Building,
  MessageSquare,
  FileCheck,
  UserX,
  Calendar,
  CheckCircle,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { getAdminStats, getRecentActivity } from '@/lib/data/admin/stats';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboardPage() {
  const [stats, recentActivity] = await Promise.all([
    getAdminStats(),
    getRecentActivity(8),
  ]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Teachers',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Parents',
      value: stats.totalParents,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Centers',
      value: stats.totalCenters,
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    {
      title: 'Completed',
      value: stats.completedBookings,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  const actionCards = [
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: MessageSquare,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      href: '/admin/reviews',
      description: 'Reviews awaiting moderation',
    },
    {
      title: 'Teacher Applications',
      value: stats.pendingApplications,
      icon: FileCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      href: '/admin/teachers',
      description: 'Pending verification requests',
    },
    {
      title: 'Suspended Users',
      value: stats.suspendedUsers,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/admin/users?suspended=true',
      description: 'Currently suspended accounts',
    },
  ];

  const activityIcons = {
    user_registered: Users,
    booking_created: Calendar,
    review_submitted: MessageSquare,
    teacher_verified: CheckCircle,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform statistics and pending actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {actionCards.map((card) => (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <span className="text-3xl font-bold">{card.value}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
              <Button asChild variant="link" className="mt-2 h-auto p-0">
                <Link href={card.href}>
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
