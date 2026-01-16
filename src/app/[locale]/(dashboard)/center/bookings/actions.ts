'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export type BookingActionState = {
  error?: string;
  success?: boolean;
};

export async function assignTeacherToBooking(
  bookingId: string,
  teacherUserId: string
): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  // Get the booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  if (!booking) {
    return { error: 'Booking not found' };
  }

  // Verify booking belongs to this center
  if (booking.centerId !== centerProfile.id) {
    return { error: 'Booking does not belong to this center' };
  }

  // Verify teacher works at this center
  const centerTeacher = await prisma.centerTeacher.findFirst({
    where: {
      centerId: centerProfile.id,
      teacher: { userId: teacherUserId },
      isActive: true,
    },
    include: { teacher: true },
  });

  if (!centerTeacher) {
    return { error: 'Teacher does not work at this center' };
  }

  // If this is a service booking, verify teacher is assigned to this service
  if (booking.serviceId) {
    const serviceAssignment = await prisma.teacherServiceAssignment.findFirst({
      where: {
        serviceId: booking.serviceId,
        teacherId: centerTeacher.teacher.id,
        isActive: true,
      },
    });

    if (!serviceAssignment) {
      return { error: 'Teacher is not assigned to this service' };
    }
  }

  // Check for booking conflicts
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      teacherId: teacherUserId,
      bookingDate: booking.bookingDate,
      id: { not: bookingId },
      status: { in: ['pending', 'confirmed'] },
      OR: [
        {
          AND: [
            { startTime: { lte: booking.startTime } },
            { endTime: { gt: booking.startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: booking.endTime } },
            { endTime: { gte: booking.endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: booking.startTime } },
            { endTime: { lte: booking.endTime } },
          ],
        },
      ],
    },
  });

  if (conflictingBooking) {
    return { error: 'Teacher has a conflicting booking at this time' };
  }

  // Assign teacher and update status to confirmed
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      teacherId: teacherUserId,
      status: 'confirmed',
    },
  });

  revalidatePath('/center/bookings');
  revalidatePath('/parent/bookings');
  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  // Get the booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { error: 'Booking not found' };
  }

  // Verify booking belongs to this center (either directly or via teacher)
  if (booking.centerId !== centerProfile.id) {
    // Check if it's a teacher booking
    const centerTeacher = await prisma.centerTeacher.findFirst({
      where: {
        centerId: centerProfile.id,
        teacher: { userId: booking.teacherId! },
      },
    });

    if (!centerTeacher) {
      return { error: 'Booking does not belong to this center' };
    }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  revalidatePath('/center/bookings');
  revalidatePath('/parent/bookings');
  return { success: true };
}
