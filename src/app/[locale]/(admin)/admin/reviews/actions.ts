'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { ModerationAction } from '@prisma/client';

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function moderateReview(
  reviewId: string,
  action: ModerationAction,
  reason?: string
): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { moderation: true },
    });

    if (!review) {
      return { error: 'Review not found' };
    }

    if (review.moderation) {
      return { error: 'Review has already been moderated' };
    }

    // Create moderation record and update review visibility
    await prisma.$transaction([
      prisma.reviewModeration.create({
        data: {
          reviewId,
          action,
          reason,
          moderatedById: session.user.id,
        },
      }),
      // Hide review if rejected or flagged
      ...(action !== 'approved'
        ? [
            prisma.review.update({
              where: { id: reviewId },
              data: { isVisible: false },
            }),
          ]
        : []),
      prisma.adminActivityLog.create({
        data: {
          adminId: session.user.id,
          action: 'review_moderation',
          targetType: 'review',
          targetId: reviewId,
          details: { action, reason },
        },
      }),
    ]);

    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error) {
    console.error('Failed to moderate review:', error);
    return { error: 'Failed to moderate review' };
  }
}
