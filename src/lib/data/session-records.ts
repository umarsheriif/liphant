import { prisma } from '@/lib/prisma';

export interface SessionRecordFilters {
  teacherId?: string;
  parentId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// Get notes for a specific booking
export async function getSessionNotes(bookingId: string, currentUserId: string) {
  const notes = await prisma.sessionNote.findMany({
    where: {
      bookingId,
      OR: [
        { isPrivate: false },
        { authorId: currentUserId },
      ],
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return notes;
}

// Get documents for a specific booking
export async function getSessionDocuments(bookingId: string, currentUserId: string) {
  const documents = await prisma.sessionDocument.findMany({
    where: {
      bookingId,
      OR: [
        { isPrivate: false },
        { uploadedById: currentUserId },
      ],
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return documents;
}

// Get all session records for a teacher
export async function getTeacherSessionRecords(
  teacherId: string,
  filters?: SessionRecordFilters
) {
  const bookings = await prisma.booking.findMany({
    where: {
      teacherId,
      status: { in: ['confirmed', 'completed'] },
      ...(filters?.parentId && { parentId: filters.parentId }),
      ...(filters?.startDate && { bookingDate: { gte: filters.startDate } }),
      ...(filters?.endDate && { bookingDate: { lte: filters.endDate } }),
      ...(filters?.search && {
        OR: [
          { sessionNotes: { some: { content: { contains: filters.search, mode: 'insensitive' } } } },
          { parent: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      parent: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      sessionNotes: {
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      sessionDocuments: {
        include: {
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { bookingDate: 'desc' },
  });

  // Filter out private notes/documents not owned by the teacher
  return bookings.map((booking) => ({
    ...booking,
    sessionNotes: booking.sessionNotes.filter(
      (note) => !note.isPrivate || note.authorId === teacherId
    ),
    sessionDocuments: booking.sessionDocuments.filter(
      (doc) => !doc.isPrivate || doc.uploadedById === teacherId
    ),
  }));
}

// Get all session records for a parent
export async function getParentSessionRecords(
  parentId: string,
  filters?: SessionRecordFilters
) {
  const bookings = await prisma.booking.findMany({
    where: {
      parentId,
      status: { in: ['confirmed', 'completed'] },
      ...(filters?.teacherId && { teacherId: filters.teacherId }),
      ...(filters?.startDate && { bookingDate: { gte: filters.startDate } }),
      ...(filters?.endDate && { bookingDate: { lte: filters.endDate } }),
      ...(filters?.search && {
        OR: [
          { sessionNotes: { some: { content: { contains: filters.search, mode: 'insensitive' } } } },
          { teacher: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      sessionNotes: {
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      sessionDocuments: {
        include: {
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { bookingDate: 'desc' },
  });

  // Filter out private notes/documents not owned by the parent
  return bookings.map((booking) => ({
    ...booking,
    sessionNotes: booking.sessionNotes.filter(
      (note) => !note.isPrivate || note.authorId === parentId
    ),
    sessionDocuments: booking.sessionDocuments.filter(
      (doc) => !doc.isPrivate || doc.uploadedById === parentId
    ),
  }));
}

// Get all session records for a center (all teachers)
export async function getCenterSessionRecords(
  centerId: string,
  filters?: SessionRecordFilters
) {
  // First get all teacher IDs for this center
  const centerTeachers = await prisma.centerTeacher.findMany({
    where: {
      centerId,
      isActive: true,
    },
    select: {
      teacher: {
        select: {
          userId: true,
        },
      },
    },
  });

  const teacherUserIds = centerTeachers.map((ct) => ct.teacher.userId);

  if (teacherUserIds.length === 0) {
    return [];
  }

  const bookings = await prisma.booking.findMany({
    where: {
      teacherId: { in: teacherUserIds },
      status: { in: ['confirmed', 'completed'] },
      ...(filters?.teacherId && { teacherId: filters.teacherId }),
      ...(filters?.parentId && { parentId: filters.parentId }),
      ...(filters?.startDate && { bookingDate: { gte: filters.startDate } }),
      ...(filters?.endDate && { bookingDate: { lte: filters.endDate } }),
      ...(filters?.search && {
        OR: [
          { sessionNotes: { some: { content: { contains: filters.search, mode: 'insensitive' } } } },
          { teacher: { fullName: { contains: filters.search, mode: 'insensitive' } } },
          { parent: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      parent: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      teacher: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      sessionNotes: {
        where: { isPrivate: false }, // Center admins only see public notes
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      sessionDocuments: {
        where: { isPrivate: false }, // Center admins only see public documents
        include: {
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { bookingDate: 'desc' },
  });

  return bookings;
}

// Get booking with notes and documents for detail view
export async function getBookingWithRecords(bookingId: string, currentUserId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      teacher: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          teacherProfile: {
            select: {
              specializations: true,
            },
          },
        },
      },
      sessionNotes: {
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      sessionDocuments: {
        include: {
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!booking) return null;

  // Filter private items
  return {
    ...booking,
    sessionNotes: booking.sessionNotes.filter(
      (note) => !note.isPrivate || note.authorId === currentUserId
    ),
    sessionDocuments: booking.sessionDocuments.filter(
      (doc) => !doc.isPrivate || doc.uploadedById === currentUserId
    ),
  };
}

// Get unique teachers for a parent (for filtering)
export async function getParentTeachers(parentId: string) {
  const bookings = await prisma.booking.findMany({
    where: { parentId, teacherId: { not: null } },
    select: {
      teacher: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    distinct: ['teacherId'],
  });

  return bookings.map((b) => b.teacher).filter((t): t is { id: string; fullName: string } => t !== null);
}

// Get unique parents for a teacher (for filtering)
export async function getTeacherParents(teacherId: string) {
  const bookings = await prisma.booking.findMany({
    where: { teacherId },
    select: {
      parent: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    distinct: ['parentId'],
  });

  return bookings.map((b) => b.parent);
}

// Get center teachers for filtering
export async function getCenterTeachersList(centerId: string) {
  const centerTeachers = await prisma.centerTeacher.findMany({
    where: {
      centerId,
      isActive: true,
    },
    include: {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  return centerTeachers.map((ct) => ({
    id: ct.teacher.user.id,
    fullName: ct.teacher.user.fullName,
  }));
}
