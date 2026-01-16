import prisma from '@/lib/prisma';

/**
 * Get all services for a center
 */
export async function getCenterServices(centerId: string, includeInactive = false) {
  const services = await prisma.centerService.findMany({
    where: {
      centerId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: {
      teacherAssignments: {
        where: { isActive: true },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return services;
}

/**
 * Get a single service by ID with full details
 */
export async function getCenterServiceById(serviceId: string) {
  const service = await prisma.centerService.findUnique({
    where: { id: serviceId },
    include: {
      center: {
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          userId: true,
        },
      },
      teacherAssignments: {
        where: { isActive: true },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              availabilities: true,
            },
          },
        },
      },
    },
  });

  return service;
}

/**
 * Get aggregated availability for a service on a specific date
 * Combines availability from all teachers assigned to the service
 */
export async function getServiceAvailability(serviceId: string, date: Date) {
  const dayOfWeek = date.getDay();

  // Get service with teacher assignments and their availabilities
  const service = await prisma.centerService.findUnique({
    where: { id: serviceId },
    include: {
      teacherAssignments: {
        where: { isActive: true },
        include: {
          teacher: {
            include: {
              user: true,
              availabilities: {
                where: { dayOfWeek },
              },
            },
          },
        },
      },
    },
  });

  if (!service) {
    return [];
  }

  // Get all teacher user IDs for checking bookings
  const teacherUserIds = service.teacherAssignments.map(
    (assignment) => assignment.teacher.userId
  );

  // Get existing bookings for all assigned teachers on this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      teacherId: { in: teacherUserIds },
      bookingDate: date,
      status: { in: ['pending', 'confirmed', 'awaiting_assignment'] },
    },
    select: {
      teacherId: true,
      startTime: true,
      endTime: true,
    },
  });

  // Aggregate availability slots
  const slotMap = new Map<
    string,
    { teacherIds: string[]; teacherUserIds: string[] }
  >();

  for (const assignment of service.teacherAssignments) {
    for (const availability of assignment.teacher.availabilities) {
      const key = `${availability.startTime}-${availability.endTime}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, { teacherIds: [], teacherUserIds: [] });
      }
      const slot = slotMap.get(key)!;
      slot.teacherIds.push(assignment.teacherId);
      slot.teacherUserIds.push(assignment.teacher.userId);
    }
  }

  // Build slots with availability info
  const slots = Array.from(slotMap.entries()).map(([key, { teacherIds, teacherUserIds }]) => {
    const [startTime, endTime] = key.split('-');

    // Find which teachers are available (not booked) for this slot
    const availableTeacherUserIds = teacherUserIds.filter((userId) => {
      const isBooked = existingBookings.some(
        (booking) =>
          booking.teacherId === userId &&
          isTimeOverlap(booking.startTime, booking.endTime, startTime, endTime)
      );
      return !isBooked;
    });

    return {
      startTime,
      endTime,
      availableCount: availableTeacherUserIds.length,
      totalCount: teacherUserIds.length,
      isAvailable: availableTeacherUserIds.length > 0,
    };
  });

  // Sort by start time
  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Get available teachers for a specific service, date, and time slot
 */
export async function getAvailableTeachersForService(
  serviceId: string,
  date: Date,
  startTime: string,
  endTime: string
) {
  const dayOfWeek = date.getDay();

  // Get service with teacher assignments
  const service = await prisma.centerService.findUnique({
    where: { id: serviceId },
    include: {
      teacherAssignments: {
        where: { isActive: true },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              availabilities: {
                where: {
                  dayOfWeek,
                  startTime: { lte: startTime },
                  endTime: { gte: endTime },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!service) {
    return [];
  }

  // Filter to teachers who have availability for this slot
  const teachersWithAvailability = service.teacherAssignments.filter(
    (assignment) => assignment.teacher.availabilities.length > 0
  );

  // Get existing bookings for these teachers on this date
  const teacherUserIds = teachersWithAvailability.map(
    (assignment) => assignment.teacher.userId
  );

  const existingBookings = await prisma.booking.findMany({
    where: {
      teacherId: { in: teacherUserIds },
      bookingDate: date,
      status: { in: ['pending', 'confirmed', 'awaiting_assignment'] },
    },
    select: {
      teacherId: true,
      startTime: true,
      endTime: true,
    },
  });

  // Filter out teachers who are already booked
  const availableTeachers = teachersWithAvailability.filter((assignment) => {
    const isBooked = existingBookings.some(
      (booking) =>
        booking.teacherId === assignment.teacher.userId &&
        isTimeOverlap(booking.startTime, booking.endTime, startTime, endTime)
    );
    return !isBooked;
  });

  return availableTeachers.map((assignment) => ({
    teacherProfileId: assignment.teacher.id,
    userId: assignment.teacher.userId,
    fullName: assignment.teacher.user.fullName,
    avatarUrl: assignment.teacher.user.avatarUrl,
  }));
}

/**
 * Get unassigned bookings for a center (awaiting_assignment status)
 */
export async function getCenterUnassignedBookings(centerId: string) {
  const bookings = await prisma.booking.findMany({
    where: {
      centerId,
      status: 'awaiting_assignment',
    },
    include: {
      parent: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          duration: true,
        },
      },
    },
    orderBy: { bookingDate: 'asc' },
  });

  return bookings;
}

/**
 * Get all bookings for a center (including assigned ones)
 */
export async function getCenterBookings(
  centerId: string,
  status?: 'all' | 'unassigned' | 'assigned'
) {
  // Build the where clause based on status filter
  let whereClause;

  if (status === 'unassigned') {
    whereClause = {
      centerId,
      status: 'awaiting_assignment' as const,
    };
  } else if (status === 'assigned') {
    whereClause = {
      centerId,
      teacherId: { not: null },
      status: { in: ['pending', 'confirmed', 'completed'] as ('pending' | 'confirmed' | 'completed')[] },
    };
  } else {
    whereClause = { centerId };
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      parent: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          phone: true,
        },
      },
      teacher: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      service: {
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          duration: true,
          price: true,
        },
      },
    },
    orderBy: { bookingDate: 'desc' },
  });

  return bookings;
}

/**
 * Helper: Check if two time ranges overlap
 */
function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert HH:MM to minutes for comparison
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  // Check for overlap
  return s1 < e2 && s2 < e1;
}
