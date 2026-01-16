import { z } from 'zod';

export const createSessionNoteSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  content: z.string().min(1, 'Note content is required').max(5000, 'Note too long'),
  isPrivate: z.boolean().default(false),
});

export const updateSessionNoteSchema = z.object({
  noteId: z.string().min(1, 'Note ID is required'),
  content: z.string().min(1, 'Note content is required').max(5000, 'Note too long'),
  isPrivate: z.boolean().default(false),
});

export const deleteSessionNoteSchema = z.object({
  noteId: z.string().min(1, 'Note ID is required'),
});

export const createSessionDocumentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  name: z.string().min(1, 'Document name is required').max(255, 'Name too long'),
  fileUrl: z.string().url('Invalid file URL'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().optional(),
  isPrivate: z.boolean().default(false),
});

export const deleteSessionDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
});

export type CreateSessionNoteInput = z.infer<typeof createSessionNoteSchema>;
export type UpdateSessionNoteInput = z.infer<typeof updateSessionNoteSchema>;
export type CreateSessionDocumentInput = z.infer<typeof createSessionDocumentSchema>;
