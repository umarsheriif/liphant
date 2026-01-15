'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveTeacher(teacherId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await prisma.teacherProfile.update({
    where: { id: teacherId },
    data: { isVerified: true },
  });

  // Log the action
  await prisma.adminActivityLog.create({
    data: {
      adminId: session.user.id,
      action: 'approve_teacher',
      targetType: 'teacher',
      targetId: teacherId,
      details: { action: 'verified' },
    },
  });

  revalidatePath('/admin/teachers');
  return { success: true };
}

export async function rejectTeacher(teacherId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await prisma.teacherProfile.update({
    where: { id: teacherId },
    data: { isVerified: false },
  });

  // Log the action
  await prisma.adminActivityLog.create({
    data: {
      adminId: session.user.id,
      action: 'reject_teacher',
      targetType: 'teacher',
      targetId: teacherId,
      details: { action: 'rejected' },
    },
  });

  revalidatePath('/admin/teachers');
  return { success: true };
}

export async function approveApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const application = await prisma.teacherApplication.update({
    where: { id: applicationId },
    data: {
      status: 'approved',
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
    include: { user: true },
  });

  // Also verify the teacher profile
  await prisma.teacherProfile.updateMany({
    where: { userId: application.userId },
    data: { isVerified: true },
  });

  // Log the action
  await prisma.adminActivityLog.create({
    data: {
      adminId: session.user.id,
      action: 'approve_application',
      targetType: 'application',
      targetId: applicationId,
      details: { userId: application.userId },
    },
  });

  revalidatePath('/admin/teachers');
  return { success: true };
}

export async function rejectApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await prisma.teacherApplication.update({
    where: { id: applicationId },
    data: {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  });

  // Log the action
  await prisma.adminActivityLog.create({
    data: {
      adminId: session.user.id,
      action: 'reject_application',
      targetType: 'application',
      targetId: applicationId,
      details: { action: 'rejected' },
    },
  });

  revalidatePath('/admin/teachers');
  return { success: true };
}
