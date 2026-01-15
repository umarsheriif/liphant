import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database...');

  // Create admin user
  // IMPORTANT: Change this password immediately after first login!
  const adminPassword = await bcrypt.hash('Liphant@Admin2026!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@liphant.co' },
    update: {},
    create: {
      email: 'admin@liphant.co',
      password: adminPassword,
      fullName: 'Liphant Admin',
      role: 'admin',
      preferredLanguage: 'en',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create forum categories (required for forum to function)
  const forumCategories = [
    {
      name: 'ADHD Support',
      nameAr: 'دعم فرط الحركة',
      slug: 'adhd',
      description: 'Discuss strategies, experiences, and resources related to ADHD',
      icon: 'Brain',
      sortOrder: 1,
    },
    {
      name: 'Autism Spectrum',
      nameAr: 'طيف التوحد',
      slug: 'autism',
      description: 'Share resources, support, and experiences for autism spectrum',
      icon: 'Puzzle',
      sortOrder: 2,
    },
    {
      name: 'Speech & Language',
      nameAr: 'النطق واللغة',
      slug: 'speech',
      description: 'Speech therapy tips, language development, and communication strategies',
      icon: 'MessageSquare',
      sortOrder: 3,
    },
    {
      name: 'Occupational Therapy',
      nameAr: 'العلاج الوظيفي',
      slug: 'occupational',
      description: 'Fine motor skills, sensory processing, and daily living activities',
      icon: 'Hand',
      sortOrder: 4,
    },
    {
      name: 'School & Education',
      nameAr: 'المدرسة والتعليم',
      slug: 'education',
      description: 'School-related topics, IEP discussions, and educational resources',
      icon: 'GraduationCap',
      sortOrder: 5,
    },
    {
      name: 'Parenting Tips',
      nameAr: 'نصائح الأبوة',
      slug: 'parenting',
      description: 'General parenting discussions, tips, and emotional support',
      icon: 'Heart',
      sortOrder: 6,
    },
    {
      name: 'Local Resources',
      nameAr: 'الموارد المحلية',
      slug: 'resources',
      description: 'Find and share local therapy centers, doctors, and services',
      icon: 'MapPin',
      sortOrder: 7,
    },
    {
      name: 'Success Stories',
      nameAr: 'قصص النجاح',
      slug: 'success',
      description: 'Share milestones, achievements, and inspiring stories',
      icon: 'Star',
      sortOrder: 8,
    },
  ];

  for (const category of forumCategories) {
    await prisma.forumCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        nameAr: category.nameAr,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
  }
  console.log('Created', forumCategories.length, 'forum categories');

  console.log('\n========================================');
  console.log('Production seeding completed!');
  console.log('========================================');
  console.log('\nAdmin credentials:');
  console.log('  Email: admin@liphant.co');
  console.log('  Password: Liphant@Admin2026!');
  console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
