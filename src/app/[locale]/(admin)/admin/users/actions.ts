'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function suspendUser(userId: string, reason: string): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  if (!reason.trim()) {
    return { error: 'Suspension reason is required' };
  }

  try {
    // Check if user exists and is not already suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (user.isSuspended) {
      return { error: 'User is already suspended' };
    }

    // Cannot suspend admin users
    if (user.role === 'admin') {
      return { error: 'Cannot suspend admin users' };
    }

    // Suspend user and create suspension record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isSuspended: true },
      }),
      prisma.userSuspension.create({
        data: {
          userId,
          reason,
          suspendedById: session.user.id,
        },
      }),
      prisma.adminActivityLog.create({
        data: {
          adminId: session.user.id,
          action: 'user_suspension',
          targetType: 'user',
          targetId: userId,
          details: { reason },
        },
      }),
    ]);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to suspend user:', error);
    return { error: 'Failed to suspend user' };
  }
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (!user.isSuspended) {
      return { error: 'User is not suspended' };
    }

    // Find the latest suspension record
    const latestSuspension = await prisma.userSuspension.findFirst({
      where: {
        userId,
        unsuspendedAt: null,
      },
      orderBy: { suspendedAt: 'desc' },
    });

    // Unsuspend user and update suspension record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isSuspended: false },
      }),
      ...(latestSuspension
        ? [
            prisma.userSuspension.update({
              where: { id: latestSuspension.id },
              data: {
                unsuspendedAt: new Date(),
                unsuspendedById: session.user.id,
              },
            }),
          ]
        : []),
      prisma.adminActivityLog.create({
        data: {
          adminId: session.user.id,
          action: 'user_unsuspension',
          targetType: 'user',
          targetId: userId,
          details: {},
        },
      }),
    ]);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to unsuspend user:', error);
    return { error: 'Failed to unsuspend user' };
  }
}
