'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export type BookingActionState = {
  error?: string;
  success?: boolean;
};

export async function confirmBooking(bookingId: string): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    return { error: 'Unauthorized' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.teacherId !== session.user.id) {
    return { error: 'Booking not found' };
  }

  if (booking.status !== 'pending') {
    return { error: 'Booking is not pending' };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'confirmed' },
  });

  revalidatePath('/teacher/bookings');
  revalidatePath('/parent/bookings');

  return { success: true };
}

export async function declineBooking(bookingId: string): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    return { error: 'Unauthorized' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.teacherId !== session.user.id) {
    return { error: 'Booking not found' };
  }

  if (booking.status !== 'pending') {
    return { error: 'Booking is not pending' };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled' },
  });

  revalidatePath('/teacher/bookings');
  revalidatePath('/parent/bookings');

  return { success: true };
}

export async function completeBooking(bookingId: string): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    return { error: 'Unauthorized' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.teacherId !== session.user.id) {
    return { error: 'Booking not found' };
  }

  if (booking.status !== 'confirmed') {
    return { error: 'Booking must be confirmed first' };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'completed' },
  });

  revalidatePath('/teacher/bookings');
  revalidatePath('/parent/bookings');

  return { success: true };
}
