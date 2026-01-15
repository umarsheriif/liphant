'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function addComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const postId = formData.get('postId') as string;
  const content = formData.get('content') as string;

  if (!postId || !content?.trim()) {
    throw new Error('Post ID and content are required');
  }

  // Check if post exists and is not locked
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { isLocked: true, category: { select: { slug: true } } },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.isLocked) {
    throw new Error('This post is locked');
  }

  await prisma.forumComment.create({
    data: {
      postId,
      authorId: session.user.id,
      content: content.trim(),
    },
  });

  revalidatePath(`/community/forum/post/${postId}`);
}
