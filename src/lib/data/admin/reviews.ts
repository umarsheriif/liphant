import prisma from '@/lib/prisma';
import type { ModerationAction } from '@prisma/client';

export interface ReviewFilters {
  status?: 'pending' | 'moderated';
  action?: ModerationAction;
  page?: number;
  pageSize?: number;
}

export async function getReviews(filters: ReviewFilters = {}) {
  const { status, action, page = 1, pageSize = 20 } = filters;

  const where = {
    ...(status === 'pending' && { moderation: null }),
    ...(status === 'moderated' && { moderation: { isNot: null } }),
    ...(action && { moderation: { action } }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        parent: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        teacher: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        booking: {
          select: { id: true, bookingDate: true, totalAmount: true },
        },
        moderation: {
          include: {
            moderatedBy: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getReviewById(reviewId: string) {
  return prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      parent: {
        select: { id: true, fullName: true, avatarUrl: true, email: true },
      },
      teacher: {
        select: { id: true, fullName: true, avatarUrl: true, email: true },
      },
      booking: true,
      moderation: {
        include: {
          moderatedBy: { select: { fullName: true } },
        },
      },
    },
  });
}
