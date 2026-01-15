import prisma from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isSuspended?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  isSuspended: boolean;
  createdAt: Date;
  _count: {
    bookingsAsParent: number;
    bookingsAsTeacher: number;
    reviewsGiven: number;
    reviewsReceived: number;
  };
}

export async function getUsers(filters: UserFilters = {}) {
  const {
    search,
    role,
    isSuspended,
    page = 1,
    pageSize = 20,
  } = filters;

  const where = {
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(role && { role }),
    ...(isSuspended !== undefined && { isSuspended }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        isSuspended: true,
        createdAt: true,
        _count: {
          select: {
            bookingsAsParent: true,
            bookingsAsTeacher: true,
            reviewsGiven: true,
            reviewsReceived: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      parentProfile: true,
      teacherProfile: true,
      centerProfile: true,
      suspensionsReceived: {
        orderBy: { suspendedAt: 'desc' },
        include: {
          suspendedBy: { select: { fullName: true } },
          unsuspendedBy: { select: { fullName: true } },
        },
      },
      _count: {
        select: {
          bookingsAsParent: true,
          bookingsAsTeacher: true,
          reviewsGiven: true,
          reviewsReceived: true,
        },
      },
    },
  });
}
