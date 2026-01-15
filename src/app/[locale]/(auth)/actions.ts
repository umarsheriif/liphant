'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { AuthError } from 'next-auth';

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    return {
      error: firstError?.message || 'Invalid input',
    };
  }

  try {
    // Get the user to determine their role for redirect
    const user = await prisma.user.findUnique({
      where: { email: validatedFields.data.email },
      select: { role: true },
    });

    await signIn('credentials', {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });

    // Redirect based on role
    const dashboardPath = user?.role === 'teacher'
      ? '/teacher/dashboard'
      : '/parent/dashboard';
    redirect(dashboardPath);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password' };
    }
    throw error;
  }
}

export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    phone: formData.get('phone') || undefined,
    role: formData.get('role'),
  };

  const validatedFields = registerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    return {
      error: firstError?.message || 'Invalid input',
    };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedFields.data.email },
  });

  if (existingUser) {
    return { error: 'This email is already registered' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedFields.data.password, 12);

  // Create user with profile
  try {
    await prisma.user.create({
      data: {
        email: validatedFields.data.email,
        password: hashedPassword,
        fullName: validatedFields.data.fullName,
        phone: validatedFields.data.phone || null,
        role: validatedFields.data.role as 'parent' | 'teacher',
        preferredLanguage: 'en',
        ...(validatedFields.data.role === 'parent'
          ? {
              parentProfile: {
                create: {
                  childrenCount: 0,
                  childrenAges: [],
                  childrenConditions: [],
                },
              },
            }
          : {
              teacherProfile: {
                create: {
                  specializations: [],
                  experienceYears: 0,
                  hourlyRate: 0,
                  serviceRadiusKm: 10,
                  isVerified: false,
                  isAvailable: true,
                  ratingAvg: 0,
                  reviewCount: 0,
                  certifications: [],
                },
              },
            }),
      },
    });
  } catch (error) {
    console.error('User creation error:', error);
    return { error: 'Failed to create account. Please try again.' };
  }

  // Sign in the user
  try {
    await signIn('credentials', {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });
  } catch (error) {
    // User was created but sign in failed - they can manually sign in
    console.error('Auto sign-in error:', error);
  }

  // Redirect based on role
  const dashboardPath = validatedFields.data.role === 'teacher'
    ? '/teacher/dashboard'
    : '/parent/dashboard';
  redirect(dashboardPath);
}

export async function logout() {
  await signOut({ redirect: false });
  redirect('/');
}
