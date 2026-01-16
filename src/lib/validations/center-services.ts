import { z } from 'zod';

export const createServiceSchema = z.object({
  nameEn: z.string().min(1, 'English name is required').max(100),
  nameAr: z.string().max(100).optional(),
  descriptionEn: z.string().max(500).optional(),
  descriptionAr: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
});

export const updateServiceSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
  nameEn: z.string().min(1, 'English name is required').max(100).optional(),
  nameAr: z.string().max(100).optional(),
  descriptionEn: z.string().max(500).optional(),
  descriptionAr: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  duration: z.number().min(15).max(480).optional(),
  isActive: z.boolean().optional(),
});

export const teacherServiceAssignmentSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
});

export const createCenterBookingSchema = z.object({
  centerId: z.string().min(1, 'Center ID is required'),
  serviceId: z.string().min(1, 'Service is required'),
  bookingDate: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  notes: z.string().optional(),
});

export const assignTeacherToBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type TeacherServiceAssignmentInput = z.infer<typeof teacherServiceAssignmentSchema>;
export type CreateCenterBookingInput = z.infer<typeof createCenterBookingSchema>;
export type AssignTeacherToBookingInput = z.infer<typeof assignTeacherToBookingSchema>;
