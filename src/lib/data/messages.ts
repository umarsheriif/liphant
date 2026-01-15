import prisma from '@/lib/prisma';

export async function getConversationsForUser(userId: string, role: 'parent' | 'teacher') {
  const conversations = await prisma.conversation.findMany({
    where: role === 'parent' ? { parentId: userId } : { teacherId: userId },
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
              isVerified: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  return conversations.map((conv) => ({
    id: conv.id,
    otherUser: role === 'parent' ? conv.teacher : conv.parent,
    lastMessage: conv.messages[0] || null,
    lastMessageAt: conv.lastMessageAt,
    unreadCount: 0, // Will be calculated below
  }));
}

export async function getConversationById(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ parentId: userId }, { teacherId: userId }],
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
          teacherProfile: {
            select: {
              isVerified: true,
              hourlyRate: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return conversation;
}

export async function getOrCreateConversation(parentId: string, teacherId: string) {
  let conversation = await prisma.conversation.findUnique({
    where: {
      parentId_teacherId: { parentId, teacherId },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        parentId,
        teacherId,
      },
    });
  }

  return conversation;
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ parentId: userId }, { teacherId: userId }],
      },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return count;
}

export async function markConversationAsRead(conversationId: string, userId: string) {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });
}
