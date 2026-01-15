'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createBookingSchema } from '@/lib/validations/booking';

export type BookingActionState = {
  error?: string;
  success?: boolean;
};

export async function createBooking(
  prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: 'You must be logged in to book' };
  }

  const rawData = {
    teacherId: formData.get('teacherId'),
    bookingDate: formData.get('bookingDate'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    notes: formData.get('notes') || undefined,
  };

  const validated = createBookingSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Invalid input' };
  }

  // Get teacher's hourly rate
  const teacher = await prisma.user.findUnique({
    where: { id: validated.data.teacherId },
    include: { teacherProfile: true },
  });

  if (!teacher?.teacherProfile) {
    return { error: 'Teacher not found' };
  }

  // Calculate duration and total amount
  const [startHour, startMin] = validated.data.startTime.split(':').map(Number);
  const [endHour, endMin] = validated.data.endTime.split(':').map(Number);
  const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);
  const totalAmount = Math.round(teacher.teacherProfile.hourlyRate * durationHours);

  // Check for conflicting bookings
  const existingBooking = await prisma.booking.findFirst({
    where: {
      teacherId: validated.data.teacherId,
      bookingDate: new Date(validated.data.bookingDate),
      status: { in: ['pending', 'confirmed'] },
      OR: [
        {
          AND: [
            { startTime: { lte: validated.data.startTime } },
            { endTime: { gt: validated.data.startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: validated.data.endTime } },
            { endTime: { gte: validated.data.endTime } },
          ],
        },
      ],
    },
  });

  if (existingBooking) {
    return { error: 'This time slot is already booked' };
  }

  // Create booking
  await prisma.booking.create({
    data: {
      parentId: session.user.id,
      teacherId: validated.data.teacherId,
      bookingDate: new Date(validated.data.bookingDate),
      startTime: validated.data.startTime,
      endTime: validated.data.endTime,
      totalAmount,
      notes: validated.data.notes || null,
      status: 'pending',
    },
  });

  revalidatePath('/parent/bookings');
  revalidatePath('/teacher/bookings');

  return { success: true };
}

export async function cancelBooking(bookingId: string): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: 'You must be logged in' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { error: 'Booking not found' };
  }

  if (booking.parentId !== session.user.id && booking.teacherId !== session.user.id) {
    return { error: 'Unauthorized' };
  }

  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return { error: 'Cannot cancel this booking' };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled' },
  });

  revalidatePath('/parent/bookings');
  revalidatePath('/teacher/bookings');

  return { success: true };
}
