'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createBookingSchema } from '@/lib/validations/booking';
import { revalidatePath } from 'next/cache';

export async function createBooking(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'You must be logged in to book a session' };
  }

  if (session.user.role !== 'parent') {
    return { error: 'Only parents can book sessions' };
  }

  const rawData = {
    teacherId: formData.get('teacherId') as string,
    bookingDate: formData.get('bookingDate') as string,
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    notes: formData.get('notes') as string || undefined,
  };

  const validated = createBookingSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { teacherId, bookingDate, startTime, endTime, notes } = validated.data;

  // Get teacher to check hourly rate
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    include: { teacherProfile: true },
  });

  if (!teacher || teacher.role !== 'teacher' || !teacher.teacherProfile) {
    return { error: 'Teacher not found' };
  }

  // Check for conflicting bookings
  const existingBooking = await prisma.booking.findFirst({
    where: {
      teacherId,
      bookingDate: new Date(bookingDate),
      status: { in: ['pending', 'confirmed'] },
      OR: [
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
      ],
    },
  });

  if (existingBooking) {
    return { error: 'This time slot is no longer available' };
  }

  // Create the booking
  await prisma.booking.create({
    data: {
      parentId: session.user.id,
      teacherId,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      totalAmount: teacher.teacherProfile.hourlyRate,
      notes,
      status: 'pending',
    },
  });

  revalidatePath('/parent/bookings');
  revalidatePath('/teacher/bookings');

  return { success: true };
}

export async function getTeacherAvailability(
  teacherProfileId: string,
  dateStr: string
) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  // Get teacher's availability for this day
  const availabilities = await prisma.availability.findMany({
    where: {
      teacherId: teacherProfileId,
      dayOfWeek,
    },
    orderBy: { startTime: 'asc' },
  });

  // Get the teacher's userId
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    select: { userId: true },
  });

  if (!teacherProfile) {
    return [];
  }

  // Get existing bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      teacherId: teacherProfile.userId,
      bookingDate: date,
      status: { in: ['pending', 'confirmed'] },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // Create time slots with booking status
  const slots = availabilities.map((availability) => ({
    startTime: availability.startTime,
    endTime: availability.endTime,
    isBooked: existingBookings.some(
      (booking) =>
        booking.startTime === availability.startTime ||
        (booking.startTime < availability.endTime &&
          booking.endTime > availability.startTime)
    ),
  }));

  return slots;
}
