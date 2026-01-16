import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://liphant.co';
const locales = ['en', 'ar'] as const;

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: { path: string; changeFrequency: ChangeFrequency; priority: number }[] = [
    { path: '', changeFrequency: 'daily', priority: 1 },
    { path: '/teachers', changeFrequency: 'daily', priority: 0.9 },
    { path: '/centers', changeFrequency: 'daily', priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Generate static page entries for all locales
  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // Fetch all verified teachers
  const teachers = await prisma.teacherProfile.findMany({
    where: {
      isVerified: true,
    },
    select: {
      id: true,
    },
  });

  // Generate teacher page entries for all locales
  const teacherEntries: MetadataRoute.Sitemap = teachers.flatMap((teacher) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/teachers/${teacher.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    }))
  );

  // Fetch all verified centers
  const centers = await prisma.centerProfile.findMany({
    where: {
      isVerified: true,
    },
    select: {
      id: true,
    },
  });

  // Generate center page entries for all locales
  const centerEntries: MetadataRoute.Sitemap = centers.flatMap((center) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/centers/${center.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    }))
  );

  // Community pages
  const communityPages: { path: string; changeFrequency: ChangeFrequency; priority: number }[] = [
    { path: '/community', changeFrequency: 'daily', priority: 0.6 },
    { path: '/community/forum', changeFrequency: 'daily', priority: 0.6 },
    { path: '/community/events', changeFrequency: 'daily', priority: 0.6 },
  ];

  const communityEntries: MetadataRoute.Sitemap = communityPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  return [
    ...staticEntries,
    ...teacherEntries,
    ...centerEntries,
    ...communityEntries,
  ];
}
