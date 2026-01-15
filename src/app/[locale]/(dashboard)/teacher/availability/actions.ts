'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { availabilitySchema } from '@/lib/validations/booking';

export type AvailabilityActionState = {
  error?: string;
  success?: boolean;
};

export async function addAvailability(
  prevState: AvailabilityActionState,
  formData: FormData
): Promise<AvailabilityActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    return { error: 'Unauthorized' };
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacherProfile) {
    return { error: 'Teacher profile not found' };
  }

  const rawData = {
    dayOfWeek: parseInt(formData.get('dayOfWeek') as string),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    isRecurring: formData.get('isRecurring') === 'true',
  };

  const validated = availabilitySchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Invalid input' };
  }

  // Check for overlapping availability
  // Two time ranges overlap if: start1 < end2 AND start2 < end1
  const existingSlot = await prisma.availability.findFirst({
    where: {
      teacherId: teacherProfile.id,
      dayOfWeek: validated.data.dayOfWeek,
      startTime: { lt: validated.data.endTime },
      endTime: { gt: validated.data.startTime },
    },
  });

  if (existingSlot) {
    return { error: 'This time slot overlaps with existing availability' };
  }

  await prisma.availability.create({
    data: {
      teacherId: teacherProfile.id,
      dayOfWeek: validated.data.dayOfWeek,
      startTime: validated.data.startTime,
      endTime: validated.data.endTime,
      isRecurring: validated.data.isRecurring,
    },
  });

  revalidatePath('/teacher/availability');
  return { success: true };
}

export async function removeAvailability(
  availabilityId: string
): Promise<AvailabilityActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    return { error: 'Unauthorized' };
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacherProfile) {
    return { error: 'Teacher profile not found' };
  }

  const availability = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });

  if (!availability || availability.teacherId !== teacherProfile.id) {
    return { error: 'Availability not found' };
  }

  await prisma.availability.delete({
    where: { id: availabilityId },
  });

  revalidatePath('/teacher/availability');
  return { success: true };
}
