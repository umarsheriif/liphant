import { z } from 'zod';

export const createBookingSchema = z.object({
  teacherId: z.string().min(1, 'Teacher is required'),
  bookingDate: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  status: z.enum(['confirmed', 'cancelled', 'completed']),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isRecurring: z.boolean().default(true),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
