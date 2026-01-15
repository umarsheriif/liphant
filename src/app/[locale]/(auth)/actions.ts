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
    let dashboardPath = '/parent/dashboard';
    switch (user?.role) {
      case 'admin':
        dashboardPath = '/admin';
        break;
      case 'teacher':
        dashboardPath = '/teacher/dashboard';
        break;
      case 'center_admin':
        dashboardPath = '/center/dashboard';
        break;
    }
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
    centerName: formData.get('centerName') || undefined,
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

  // Create user with profile based on role
  try {
    const profileData = (() => {
      switch (validatedFields.data.role) {
        case 'parent':
          return {
            parentProfile: {
              create: {
                childrenCount: 0,
                childrenAges: [],
                childrenConditions: [],
              },
            },
          };
        case 'teacher':
          return {
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
          };
        case 'center_admin':
          return {
            centerProfile: {
              create: {
                nameEn: validatedFields.data.centerName || validatedFields.data.fullName + "'s Center",
                specializations: [],
                servicesOffered: [],
                operatingHours: {},
                isVerified: false,
              },
            },
          };
        default:
          return {};
      }
    })();

    await prisma.user.create({
      data: {
        email: validatedFields.data.email,
        password: hashedPassword,
        fullName: validatedFields.data.fullName,
        phone: validatedFields.data.phone || null,
        role: validatedFields.data.role as 'parent' | 'teacher' | 'center_admin',
        preferredLanguage: 'en',
        ...profileData,
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
  let dashboardPath = '/parent/dashboard';
  switch (validatedFields.data.role) {
    case 'teacher':
      dashboardPath = '/teacher/dashboard';
      break;
    case 'center_admin':
      dashboardPath = '/center/dashboard';
      break;
  }
  redirect(dashboardPath);
}

export async function logout() {
  await signOut({ redirect: false });
  redirect('/');
}
