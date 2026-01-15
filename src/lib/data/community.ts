import prisma from '@/lib/prisma';
import type { EventCategory, EventStatus } from '@prisma/client';

// Events
export interface EventFilters {
  search?: string;
  category?: EventCategory;
  city?: string;
  status?: EventStatus;
  page?: number;
  pageSize?: number;
}

export async function getEvents(filters: EventFilters = {}) {
  const { search, category, city, status, page = 1, pageSize = 20 } = filters;

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(category && { category }),
    ...(city && { city }),
    ...(status && { status }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        organizer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        _count: {
          select: { attendees: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events: events.map((e) => ({
      ...e,
      attendeeCount: e._count.attendees,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getEventById(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      attendees: {
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
  });
}

export async function getUserRSVP(eventId: string, userId: string) {
  return prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });
}

// Forum
export async function getForumCategories() {
  return prisma.forumCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.forumCategory.findUnique({
    where: { slug },
  });
}

export async function getPostsByCategory(categorySlug: string, page = 1, pageSize = 20) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where: { categoryId: category.id },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.forumPost.count({ where: { categoryId: category.id } }),
  ]);

  return {
    category,
    posts: posts.map((p) => ({
      ...p,
      commentCount: p._count.comments,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPostById(postId: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      category: true,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (post) {
    // Increment view count
    await prisma.forumPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });
  }

  return post;
}
