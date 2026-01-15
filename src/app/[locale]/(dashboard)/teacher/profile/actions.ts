'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Specialization } from '@prisma/client';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  bioEn: z.string().optional(),
  bioAr: z.string().optional(),
  specializations: z.array(z.string()),
  experienceYears: z.number().min(0),
  education: z.string().optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    year: z.number().optional(),
  })),
  hourlyRate: z.number().min(0),
  city: z.string().optional(),
  district: z.string().optional(),
  serviceRadiusKm: z.number().min(1).max(100),
  isAvailable: z.boolean(),
  avatarUrl: z.string().optional(),
});

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateTeacherProfile(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    return { error: 'Unauthorized' };
  }

  try {
    const avatarData = formData.get('avatarUrl') as string;

    const rawData = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string || undefined,
      bioEn: formData.get('bioEn') as string || undefined,
      bioAr: formData.get('bioAr') as string || undefined,
      specializations: JSON.parse(formData.get('specializations') as string || '[]'),
      experienceYears: parseInt(formData.get('experienceYears') as string) || 0,
      education: formData.get('education') as string || undefined,
      certifications: JSON.parse(formData.get('certifications') as string || '[]'),
      hourlyRate: parseInt(formData.get('hourlyRate') as string) || 0,
      city: formData.get('city') as string || undefined,
      district: formData.get('district') as string || undefined,
      serviceRadiusKm: parseInt(formData.get('serviceRadiusKm') as string) || 10,
      isAvailable: formData.get('isAvailable') === 'true',
      avatarUrl: avatarData || undefined,
    };

    const validated = updateProfileSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: validated.error.issues[0]?.message || 'Invalid input' };
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: validated.data.fullName,
        phone: validated.data.phone || null,
        ...(validated.data.avatarUrl && { avatarUrl: validated.data.avatarUrl }),
      },
    });

    // Update teacher profile
    await prisma.teacherProfile.update({
      where: { userId: session.user.id },
      data: {
        bioEn: validated.data.bioEn || null,
        bioAr: validated.data.bioAr || null,
        specializations: validated.data.specializations as Specialization[],
        experienceYears: validated.data.experienceYears,
        education: validated.data.education || null,
        certifications: validated.data.certifications,
        hourlyRate: validated.data.hourlyRate,
        city: validated.data.city || null,
        district: validated.data.district || null,
        serviceRadiusKm: validated.data.serviceRadiusKm,
        isAvailable: validated.data.isAvailable,
      },
    });

    revalidatePath('/teacher/profile');
    revalidatePath('/teacher/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }
}

export async function toggleAvailability(isAvailable: boolean): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.teacherProfile.update({
      where: { userId: session.user.id },
      data: { isAvailable },
    });

    revalidatePath('/teacher/profile');
    revalidatePath('/teacher/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Toggle availability error:', error);
    return { error: 'Failed to update availability.' };
  }
}
