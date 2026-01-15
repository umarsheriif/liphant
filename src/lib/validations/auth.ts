import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    role: z.enum(['parent', 'teacher', 'center_admin']),
    centerName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.role !== 'center_admin' || (data.centerName && data.centerName.length >= 2), {
    message: 'Center name must be at least 2 characters',
    path: ['centerName'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
