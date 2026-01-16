'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  createServiceSchema,
  updateServiceSchema,
  teacherServiceAssignmentSchema,
} from '@/lib/validations/center-services';

export type ServiceActionState = {
  error?: string;
  success?: boolean;
  serviceId?: string;
};

export async function createService(
  prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  const rawData = {
    nameEn: formData.get('nameEn'),
    nameAr: formData.get('nameAr') || undefined,
    descriptionEn: formData.get('descriptionEn') || undefined,
    descriptionAr: formData.get('descriptionAr') || undefined,
    price: parseInt(formData.get('price') as string) || 0,
    duration: parseInt(formData.get('duration') as string) || 60,
  };

  const validated = createServiceSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Invalid input' };
  }

  const service = await prisma.centerService.create({
    data: {
      centerId: centerProfile.id,
      nameEn: validated.data.nameEn,
      nameAr: validated.data.nameAr,
      descriptionEn: validated.data.descriptionEn,
      descriptionAr: validated.data.descriptionAr,
      price: validated.data.price,
      duration: validated.data.duration,
    },
  });

  revalidatePath('/center/services');
  return { success: true, serviceId: service.id };
}

export async function updateService(
  prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  const rawData = {
    id: formData.get('id'),
    nameEn: formData.get('nameEn') || undefined,
    nameAr: formData.get('nameAr') || undefined,
    descriptionEn: formData.get('descriptionEn') || undefined,
    descriptionAr: formData.get('descriptionAr') || undefined,
    price: formData.get('price') ? parseInt(formData.get('price') as string) : undefined,
    duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined,
    isActive: formData.get('isActive') ? formData.get('isActive') === 'true' : undefined,
  };

  const validated = updateServiceSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Invalid input' };
  }

  // Verify service belongs to this center
  const service = await prisma.centerService.findFirst({
    where: {
      id: validated.data.id,
      centerId: centerProfile.id,
    },
  });

  if (!service) {
    return { error: 'Service not found' };
  }

  await prisma.centerService.update({
    where: { id: validated.data.id },
    data: {
      ...(validated.data.nameEn && { nameEn: validated.data.nameEn }),
      ...(validated.data.nameAr !== undefined && { nameAr: validated.data.nameAr }),
      ...(validated.data.descriptionEn !== undefined && { descriptionEn: validated.data.descriptionEn }),
      ...(validated.data.descriptionAr !== undefined && { descriptionAr: validated.data.descriptionAr }),
      ...(validated.data.price !== undefined && { price: validated.data.price }),
      ...(validated.data.duration !== undefined && { duration: validated.data.duration }),
      ...(validated.data.isActive !== undefined && { isActive: validated.data.isActive }),
    },
  });

  revalidatePath('/center/services');
  revalidatePath(`/center/services/${validated.data.id}`);
  return { success: true };
}

export async function deleteService(serviceId: string): Promise<ServiceActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  const service = await prisma.centerService.findFirst({
    where: {
      id: serviceId,
      centerId: centerProfile.id,
    },
  });

  if (!service) {
    return { error: 'Service not found' };
  }

  // Check for active bookings
  const activeBookings = await prisma.booking.count({
    where: {
      serviceId,
      status: { in: ['pending', 'awaiting_assignment', 'confirmed'] },
    },
  });

  if (activeBookings > 0) {
    return { error: 'Cannot delete service with active bookings. Deactivate it instead.' };
  }

  await prisma.centerService.delete({
    where: { id: serviceId },
  });

  revalidatePath('/center/services');
  return { success: true };
}

export async function toggleServiceStatus(serviceId: string): Promise<ServiceActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  const service = await prisma.centerService.findFirst({
    where: {
      id: serviceId,
      centerId: centerProfile.id,
    },
  });

  if (!service) {
    return { error: 'Service not found' };
  }

  await prisma.centerService.update({
    where: { id: serviceId },
    data: { isActive: !service.isActive },
  });

  revalidatePath('/center/services');
  return { success: true };
}

export async function assignTeacherToService(
  serviceId: string,
  teacherId: string
): Promise<ServiceActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  // Verify service belongs to this center
  const service = await prisma.centerService.findFirst({
    where: {
      id: serviceId,
      centerId: centerProfile.id,
    },
  });

  if (!service) {
    return { error: 'Service not found' };
  }

  // Verify teacher works at this center
  const centerTeacher = await prisma.centerTeacher.findFirst({
    where: {
      centerId: centerProfile.id,
      teacherId,
      isActive: true,
    },
  });

  if (!centerTeacher) {
    return { error: 'Teacher is not active at this center' };
  }

  // Check if already assigned
  const existingAssignment = await prisma.teacherServiceAssignment.findFirst({
    where: {
      serviceId,
      teacherId,
    },
  });

  if (existingAssignment) {
    // Reactivate if inactive
    if (!existingAssignment.isActive) {
      await prisma.teacherServiceAssignment.update({
        where: { id: existingAssignment.id },
        data: { isActive: true },
      });
    }
  } else {
    await prisma.teacherServiceAssignment.create({
      data: {
        serviceId,
        teacherId,
      },
    });
  }

  revalidatePath('/center/services');
  revalidatePath(`/center/services/${serviceId}`);
  return { success: true };
}

export async function removeTeacherFromService(
  serviceId: string,
  teacherId: string
): Promise<ServiceActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'center_admin') {
    return { error: 'Unauthorized' };
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return { error: 'Center profile not found' };
  }

  // Verify service belongs to this center
  const service = await prisma.centerService.findFirst({
    where: {
      id: serviceId,
      centerId: centerProfile.id,
    },
  });

  if (!service) {
    return { error: 'Service not found' };
  }

  const assignment = await prisma.teacherServiceAssignment.findFirst({
    where: {
      serviceId,
      teacherId,
    },
  });

  if (!assignment) {
    return { error: 'Assignment not found' };
  }

  // Soft delete - set to inactive
  await prisma.teacherServiceAssignment.update({
    where: { id: assignment.id },
    data: { isActive: false },
  });

  revalidatePath('/center/services');
  revalidatePath(`/center/services/${serviceId}`);
  return { success: true };
}
