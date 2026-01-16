import prisma from '@/lib/prisma';

export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalParents: number;
  totalCenters: number;
  pendingReviews: number;
  pendingApplications: number;
  suspendedUsers: number;
  totalBookings: number;
  completedBookings: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    totalUsers,
    totalTeachers,
    totalParents,
    totalCenters,
    pendingReviews,
    pendingApplications,
    suspendedUsers,
    totalBookings,
    completedBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.user.count({ where: { role: 'parent' } }),
    prisma.user.count({ where: { role: 'center_admin' } }),
    prisma.review.count({
      where: {
        moderation: null,
      },
    }),
    prisma.teacherApplication.count({
      where: { status: 'pending' },
    }),
    prisma.user.count({ where: { isSuspended: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'completed' } }),
  ]);

  return {
    totalUsers,
    totalTeachers,
    totalParents,
    totalCenters,
    pendingReviews,
    pendingApplications,
    suspendedUsers,
    totalBookings,
    completedBookings,
  };
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'booking_created' | 'review_submitted' | 'teacher_verified';
  description: string;
  createdAt: Date;
  userId?: string;
  userName?: string;
}

export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  const [recentUsers, recentBookings, recentReviews] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        parent: { select: { fullName: true } },
        teacher: { select: { fullName: true } },
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        parent: { select: { fullName: true } },
        teacher: { select: { fullName: true } },
      },
    }),
  ]);

  const activities: RecentActivity[] = [];

  recentUsers.forEach((user) => {
    activities.push({
      id: user.id,
      type: 'user_registered',
      description: `${user.fullName} registered as ${user.role}`,
      createdAt: user.createdAt,
      userId: user.id,
      userName: user.fullName,
    });
  });

  recentBookings.forEach((booking) => {
    activities.push({
      id: booking.id,
      type: 'booking_created',
      description: `${booking.parent.fullName} booked ${booking.teacher?.fullName || 'a service'}`,
      createdAt: booking.createdAt,
    });
  });

  recentReviews.forEach((review) => {
    activities.push({
      id: review.id,
      type: 'review_submitted',
      description: `${review.parent.fullName} reviewed ${review.teacher.fullName}`,
      createdAt: review.createdAt,
    });
  });

  // Sort by createdAt descending and limit
  return activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}
