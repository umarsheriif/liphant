import prisma from '@/lib/prisma';
import type { Specialization } from '@prisma/client';

export interface CenterFilters {
  search?: string;
  specializations?: Specialization[];
  city?: string;
  minRating?: number;
  isVerified?: boolean;
}

export async function getCenters(filters: CenterFilters = {}) {
  const { search, specializations, city, minRating, isVerified } = filters;

  const where = {
    isActive: true,
    // Only show verified centers by default (for public search)
    isVerified: isVerified !== undefined ? isVerified : true,
    ...(search && {
      OR: [
        { nameEn: { contains: search, mode: 'insensitive' as const } },
        { nameAr: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(specializations?.length && {
      specializations: { hasSome: specializations },
    }),
    ...(city && { city }),
    ...(minRating && { ratingAvg: { gte: minRating } }),
  };

  const centers = await prisma.centerProfile.findMany({
    where,
    orderBy: [{ isVerified: 'desc' }, { ratingAvg: 'desc' }],
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      _count: {
        select: { centerTeachers: true },
      },
    },
  });

  return centers.map((center) => ({
    ...center,
    teacherCount: center._count.centerTeachers,
  }));
}

export async function getCenterById(centerId: string) {
  return prisma.centerProfile.findUnique({
    where: { id: centerId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
      centerTeachers: {
        where: { isActive: true },
        include: {
          teacher: {
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
        },
      },
      centerReviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          parent: {
            select: { fullName: true, avatarUrl: true },
          },
        },
      },
    },
  });
}

export async function getCenterByUserId(userId: string) {
  return prisma.centerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
      _count: {
        select: { centerTeachers: true, centerReviews: true },
      },
    },
  });
}

export async function getCenterTeachers(centerId: string) {
  return prisma.centerTeacher.findMany({
    where: { centerId, isActive: true },
    include: {
      teacher: {
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true, email: true },
          },
        },
      },
    },
  });
}

export async function getCenterCities() {
  const centers = await prisma.centerProfile.findMany({
    where: { isActive: true, isVerified: true, city: { not: null } },
    select: { city: true },
    distinct: ['city'],
  });
  return centers.map((c) => c.city).filter(Boolean) as string[];
}
