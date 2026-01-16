'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createCenterBookingSchema } from '@/lib/validations/center-services';
import { getServiceAvailability, getAvailableTeachersForService } from '@/lib/data/center-services';

export type CenterBookingActionState = {
  error?: string;
  success?: boolean;
  bookingId?: string;
};

export async function createCenterBooking(
  prevState: CenterBookingActionState,
  formData: FormData
): Promise<CenterBookingActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'parent') {
    return { error: 'Please login as a parent to make a booking' };
  }

  // Get parent profile
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!parentProfile) {
    return { error: 'Parent profile not found' };
  }

  const rawData = {
    serviceId: formData.get('serviceId'),
    bookingDate: formData.get('bookingDate'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    notes: formData.get('notes') || undefined,
  };

  const validated = createCenterBookingSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Invalid input' };
  }

  // Get the service and center
  const service = await prisma.centerService.findUnique({
    where: { id: validated.data.serviceId },
    include: { center: true },
  });

  if (!service || !service.isActive) {
    return { error: 'Service not found or is inactive' };
  }

  // Convert date string to Date object
  const bookingDate = new Date(validated.data.bookingDate);

  // Check if there are available teachers for this slot
  const availableTeachers = await getAvailableTeachersForService(
    validated.data.serviceId,
    bookingDate,
    validated.data.startTime,
    validated.data.endTime
  );

  if (availableTeachers.length === 0) {
    return { error: 'No teachers available for this time slot' };
  }

  // Create booking with awaiting_assignment status
  // The center admin will assign a teacher later
  const booking = await prisma.booking.create({
    data: {
      parentId: session.user.id,
      centerId: service.centerId,
      serviceId: service.id,
      status: 'awaiting_assignment',
      bookingDate,
      startTime: validated.data.startTime,
      endTime: validated.data.endTime,
      totalAmount: service.price,
      notes: validated.data.notes,
    },
  });

  revalidatePath('/parent/bookings');
  revalidatePath('/center/bookings');
  return { success: true, bookingId: booking.id };
}

export async function getAvailability(serviceId: string, dateStr: string) {
  const date = new Date(dateStr);
  return getServiceAvailability(serviceId, date);
}
