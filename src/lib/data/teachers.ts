import prisma from '@/lib/prisma';
import type { Specialization } from '@prisma/client';

export interface TeacherFilters {
  search?: string;
  specializations?: Specialization[];
  city?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  isAvailable?: boolean;
  isVerified?: boolean;
}

export interface TeacherListItem {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bioEn: string | null;
  bioAr: string | null;
  specializations: Specialization[];
  experienceYears: number;
  hourlyRate: number;
  city: string | null;
  district: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  ratingAvg: number;
  reviewCount: number;
}

export async function getTeachers(filters: TeacherFilters = {}): Promise<TeacherListItem[]> {
  const {
    search,
    specializations,
    city,
    minRate,
    maxRate,
    minRating,
    isAvailable,
    isVerified,
  } = filters;

  const teachers = await prisma.teacherProfile.findMany({
    where: {
      AND: [
        // Only show available teachers by default
        isAvailable !== undefined ? { isAvailable } : { isAvailable: true },
        // Verified filter
        isVerified !== undefined ? { isVerified } : {},
        // City filter
        city ? { city: { equals: city, mode: 'insensitive' } } : {},
        // Rate range
        minRate ? { hourlyRate: { gte: minRate } } : {},
        maxRate ? { hourlyRate: { lte: maxRate } } : {},
        // Rating filter
        minRating ? { ratingAvg: { gte: minRating } } : {},
        // Specializations filter (has any of the selected)
        specializations && specializations.length > 0
          ? { specializations: { hasSome: specializations } }
          : {},
        // Search by name or bio
        search
          ? {
              OR: [
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { bioEn: { contains: search, mode: 'insensitive' } },
                { bioAr: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [
      { isVerified: 'desc' },
      { ratingAvg: 'desc' },
      { reviewCount: 'desc' },
    ],
  });

  return teachers.map((teacher) => ({
    id: teacher.id,
    userId: teacher.userId,
    fullName: teacher.user.fullName,
    avatarUrl: teacher.user.avatarUrl,
    bioEn: teacher.bioEn,
    bioAr: teacher.bioAr,
    specializations: teacher.specializations,
    experienceYears: teacher.experienceYears,
    hourlyRate: teacher.hourlyRate,
    city: teacher.city,
    district: teacher.district,
    isVerified: teacher.isVerified,
    isAvailable: teacher.isAvailable,
    ratingAvg: teacher.ratingAvg,
    reviewCount: teacher.reviewCount,
  }));
}

export async function getTeacherById(teacherProfileId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      availabilities: {
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  return teacher;
}

export async function getTeacherByUserId(userId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      availabilities: {
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  return teacher;
}

export async function getTeacherReviews(teacherId: string, limit = 10) {
  const reviews = await prisma.review.findMany({
    where: {
      teacherId,
      isVisible: true,
    },
    include: {
      parent: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return reviews;
}

export async function getAvailableCities(): Promise<string[]> {
  const cities = await prisma.teacherProfile.findMany({
    where: {
      isAvailable: true,
      city: { not: null },
    },
    select: { city: true },
    distinct: ['city'],
  });

  return cities
    .map((t) => t.city)
    .filter((city): city is string => city !== null);
}
