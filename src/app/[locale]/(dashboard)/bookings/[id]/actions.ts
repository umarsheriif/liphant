'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  createSessionNoteSchema,
  updateSessionNoteSchema,
  deleteSessionNoteSchema,
  createSessionDocumentSchema,
  deleteSessionDocumentSchema,
} from '@/lib/validations/session-records';
import { deleteS3Object, extractS3KeyFromUrl } from '@/lib/s3';

// Create a new session note
export async function createSessionNote(formData: {
  bookingId: string;
  content: string;
  isPrivate: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const validated = createSessionNoteSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Verify the user has access to this booking
  const booking = await prisma.booking.findUnique({
    where: { id: validated.data.bookingId },
    select: { parentId: true, teacherId: true },
  });

  if (!booking) {
    return { error: 'Booking not found' };
  }

  // Only parent or teacher of this booking can add notes
  if (booking.parentId !== session.user.id && booking.teacherId !== session.user.id) {
    return { error: 'You do not have permission to add notes to this booking' };
  }

  try {
    const note = await prisma.sessionNote.create({
      data: {
        bookingId: validated.data.bookingId,
        authorId: session.user.id,
        content: validated.data.content,
        isPrivate: validated.data.isPrivate,
      },
    });

    revalidatePath(`/bookings/${validated.data.bookingId}`);
    return { success: true, note };
  } catch {
    return { error: 'Failed to create note' };
  }
}

// Update an existing session note
export async function updateSessionNote(formData: {
  noteId: string;
  content: string;
  isPrivate: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const validated = updateSessionNoteSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Verify ownership of the note
  const existingNote = await prisma.sessionNote.findUnique({
    where: { id: validated.data.noteId },
    select: { authorId: true, bookingId: true },
  });

  if (!existingNote) {
    return { error: 'Note not found' };
  }

  if (existingNote.authorId !== session.user.id) {
    return { error: 'You can only edit your own notes' };
  }

  try {
    const note = await prisma.sessionNote.update({
      where: { id: validated.data.noteId },
      data: {
        content: validated.data.content,
        isPrivate: validated.data.isPrivate,
      },
    });

    revalidatePath(`/bookings/${existingNote.bookingId}`);
    return { success: true, note };
  } catch {
    return { error: 'Failed to update note' };
  }
}

// Delete a session note
export async function deleteSessionNote(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const validated = deleteSessionNoteSchema.safeParse({ noteId });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Verify ownership
  const existingNote = await prisma.sessionNote.findUnique({
    where: { id: noteId },
    select: { authorId: true, bookingId: true },
  });

  if (!existingNote) {
    return { error: 'Note not found' };
  }

  if (existingNote.authorId !== session.user.id) {
    return { error: 'You can only delete your own notes' };
  }

  try {
    await prisma.sessionNote.delete({
      where: { id: noteId },
    });

    revalidatePath(`/bookings/${existingNote.bookingId}`);
    return { success: true };
  } catch {
    return { error: 'Failed to delete note' };
  }
}

// Create a new session document
export async function createSessionDocument(formData: {
  bookingId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  isPrivate: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const validated = createSessionDocumentSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Verify the user has access to this booking
  const booking = await prisma.booking.findUnique({
    where: { id: validated.data.bookingId },
    select: { parentId: true, teacherId: true },
  });

  if (!booking) {
    return { error: 'Booking not found' };
  }

  // Only parent or teacher of this booking can add documents
  if (booking.parentId !== session.user.id && booking.teacherId !== session.user.id) {
    return { error: 'You do not have permission to add documents to this booking' };
  }

  try {
    const document = await prisma.sessionDocument.create({
      data: {
        bookingId: validated.data.bookingId,
        uploadedById: session.user.id,
        name: validated.data.name,
        fileUrl: validated.data.fileUrl,
        fileType: validated.data.fileType,
        fileSize: validated.data.fileSize,
        isPrivate: validated.data.isPrivate,
      },
    });

    revalidatePath(`/bookings/${validated.data.bookingId}`);
    return { success: true, document };
  } catch {
    return { error: 'Failed to upload document' };
  }
}

// Delete a session document
export async function deleteSessionDocument(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const validated = deleteSessionDocumentSchema.safeParse({ documentId });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Verify ownership and get file URL for S3 deletion
  const existingDoc = await prisma.sessionDocument.findUnique({
    where: { id: documentId },
    select: { uploadedById: true, bookingId: true, fileUrl: true },
  });

  if (!existingDoc) {
    return { error: 'Document not found' };
  }

  if (existingDoc.uploadedById !== session.user.id) {
    return { error: 'You can only delete your own documents' };
  }

  try {
    // Delete from S3 first
    const s3Key = extractS3KeyFromUrl(existingDoc.fileUrl);
    if (s3Key) {
      try {
        await deleteS3Object(s3Key);
      } catch (s3Error) {
        console.error('Failed to delete from S3:', s3Error);
        // Continue with database deletion even if S3 fails
      }
    }

    // Delete from database
    await prisma.sessionDocument.delete({
      where: { id: documentId },
    });

    revalidatePath(`/bookings/${existingDoc.bookingId}`);
    return { success: true };
  } catch {
    return { error: 'Failed to delete document' };
  }
}
