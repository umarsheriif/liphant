import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ProfileForm } from './ProfileForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TeacherProfilePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user || session.user.role !== 'teacher') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: true,
    },
  });

  if (!user || !user.teacherProfile) {
    redirect('/login');
  }

  const profileData = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatarUrl,
    bioEn: user.teacherProfile.bioEn,
    bioAr: user.teacherProfile.bioAr,
    specializations: user.teacherProfile.specializations as string[],
    experienceYears: user.teacherProfile.experienceYears,
    education: user.teacherProfile.education,
    certifications: (user.teacherProfile.certifications as { name: string; issuer?: string; year?: number }[]) || [],
    hourlyRate: user.teacherProfile.hourlyRate,
    city: user.teacherProfile.city,
    district: user.teacherProfile.district,
    serviceRadiusKm: user.teacherProfile.serviceRadiusKm,
    isAvailable: user.teacherProfile.isAvailable,
    preferredLanguage: user.preferredLanguage,
  };

  return <ProfileForm initialData={profileData} />;
}
