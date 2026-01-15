'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveCenter(centerId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await prisma.centerProfile.update({
    where: { id: centerId },
    data: { isVerified: true },
  });

  // Log the action
  await prisma.adminActivityLog.create({
    data: {
      adminId: session.user.id,
      action: 'approve_center',
      targetType: 'center',
      targetId: centerId,
      details: { action: 'verified' },
    },
  });

  revalidatePath('/admin/centers');
  return { success: true };
}

export async function rejectCenter(centerId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await prisma.centerProfile.update({
    where: { id: centerId },
    data: { isVerified: false },
  });

  // Log the action
  await prisma.adminActivityLog.create({
    data: {
      adminId: session.user.id,
      action: 'reject_center',
      targetType: 'center',
      targetId: centerId,
      details: { action: 'rejected' },
    },
  });

  revalidatePath('/admin/centers');
  return { success: true };
}
