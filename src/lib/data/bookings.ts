import prisma from '@/lib/prisma';
import type { BookingStatus } from '@prisma/client';

export async function getBookingById(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true,
          phone: true,
        },
      },
      teacher: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true,
          phone: true,
          teacherProfile: {
            select: {
              hourlyRate: true,
              specializations: true,
            },
          },
        },
      },
      review: true,
    },
  });

  return booking;
}

export async function getBookingsForParent(
  parentId: string,
  status?: BookingStatus | BookingStatus[]
) {
  const statusFilter = status
    ? Array.isArray(status)
      ? { in: status }
      : status
    : undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      parentId,
      ...(statusFilter && { status: statusFilter }),
    },
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          teacherProfile: {
            select: {
              specializations: true,
              city: true,
            },
          },
        },
      },
      review: true,
    },
    orderBy: { bookingDate: 'desc' },
  });

  return bookings;
}

export async function getBookingsForTeacher(
  teacherId: string,
  status?: BookingStatus | BookingStatus[]
) {
  const statusFilter = status
    ? Array.isArray(status)
      ? { in: status }
      : status
    : undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      teacherId,
      ...(statusFilter && { status: statusFilter }),
    },
    include: {
      parent: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          phone: true,
          parentProfile: {
            select: {
              childrenConditions: true,
              city: true,
            },
          },
        },
      },
      review: true,
    },
    orderBy: { bookingDate: 'desc' },
  });

  return bookings;
}

export async function getUpcomingBookingsCount(userId: string, role: 'parent' | 'teacher') {
  const count = await prisma.booking.count({
    where: {
      ...(role === 'parent' ? { parentId: userId } : { teacherId: userId }),
      status: { in: ['pending', 'confirmed'] },
      bookingDate: { gte: new Date() },
    },
  });

  return count;
}

export async function getPendingBookingsCount(teacherId: string) {
  const count = await prisma.booking.count({
    where: {
      teacherId,
      status: 'pending',
    },
  });

  return count;
}

export async function getTeacherAvailabilityForDate(
  teacherProfileId: string,
  date: Date
) {
  const dayOfWeek = date.getDay();

  // Get teacher's availability for this day
  const availabilities = await prisma.availability.findMany({
    where: {
      teacherId: teacherProfileId,
      dayOfWeek,
    },
    orderBy: { startTime: 'asc' },
  });

  // Get existing bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      teacher: {
        teacherProfile: {
          id: teacherProfileId,
        },
      },
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
        booking.startTime === availability.startTime &&
        booking.endTime === availability.endTime
    ),
  }));

  return slots;
}

export async function checkBookingConflict(
  teacherId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      teacherId,
      bookingDate: date,
      status: { in: ['pending', 'confirmed'] },
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
      OR: [
        // New booking starts during existing booking
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        // New booking ends during existing booking
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        // New booking contains existing booking
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
  });

  return !!conflict;
}
