'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getOrCreateConversation, markConversationAsRead } from '@/lib/data/messages';

export async function sendMessage(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'You must be logged in to send messages' };
  }

  const conversationId = formData.get('conversationId') as string;
  const content = formData.get('content') as string;

  if (!conversationId || !content?.trim()) {
    return { error: 'Message cannot be empty' };
  }

  // Verify user is part of the conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ parentId: session.user.id }, { teacherId: session.user.id }],
    },
  });

  if (!conversation) {
    return { error: 'Conversation not found' };
  }

  // Create the message
  await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: content.trim(),
      messageType: 'text',
    },
  });

  // Update conversation's lastMessageAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath('/messages');
  revalidatePath(`/messages/${conversationId}`);

  return { success: true };
}

export async function startConversation(teacherId: string) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'You must be logged in', conversationId: null };
  }

  if (session.user.role !== 'parent') {
    return { error: 'Only parents can start conversations', conversationId: null };
  }

  // Verify teacher exists
  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: 'teacher' },
  });

  if (!teacher) {
    return { error: 'Teacher not found', conversationId: null };
  }

  const conversation = await getOrCreateConversation(session.user.id, teacherId);

  revalidatePath('/messages');

  return { success: true, conversationId: conversation.id };
}

export async function markAsRead(conversationId: string) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'You must be logged in' };
  }

  await markConversationAsRead(conversationId, session.user.id);

  revalidatePath('/messages');

  return { success: true };
}
