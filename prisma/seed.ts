import { PrismaClient, Specialization } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create parent users
  const parentPassword = await bcrypt.hash('password123', 12);

  const parent1 = await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: {
      email: 'parent@example.com',
      password: parentPassword,
      fullName: 'Hala Mahmoud',
      phone: '+201234567890',
      role: 'parent',
      preferredLanguage: 'en',
      parentProfile: {
        create: {
          childrenCount: 2,
          childrenAges: [7, 10],
          childrenConditions: ['adhd', 'autism'],
          city: 'Cairo',
          district: 'Maadi',
        },
      },
    },
  });

  const parent2 = await prisma.user.upsert({
    where: { email: 'amira@example.com' },
    update: {},
    create: {
      email: 'amira@example.com',
      password: parentPassword,
      fullName: 'Amira Saeed',
      phone: '+201234567891',
      role: 'parent',
      preferredLanguage: 'ar',
      parentProfile: {
        create: {
          childrenCount: 1,
          childrenAges: [5],
          childrenConditions: ['speech', 'developmental'],
          city: 'Cairo',
          district: 'Heliopolis',
        },
      },
    },
  });

  console.log('Created parents:', parent1.fullName, parent2.fullName);

  // Create teacher users
  const teacherPassword = await bcrypt.hash('password123', 12);

  const teacher1 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      password: teacherPassword,
      fullName: 'Sarah Ahmed',
      phone: '+201234567892',
      role: 'teacher',
      preferredLanguage: 'en',
      teacherProfile: {
        create: {
          bioEn: 'Experienced shadow teacher specializing in ADHD and autism spectrum disorders. I believe every child can thrive with the right support and personalized approach. With over 5 years of experience working with children aged 4-12, I have developed effective strategies to help each child reach their full potential.\n\nMy approach focuses on building trust, creating structured learning environments, and collaborating closely with parents and school staff to ensure consistency across all settings.',
          bioAr: 'معلمة ظل متخصصة في فرط الحركة وتشتت الانتباه وطيف التوحد. أؤمن أن كل طفل يمكنه النجاح مع الدعم المناسب والنهج الشخصي.',
          specializations: ['adhd', 'autism', 'behavioral'] as Specialization[],
          experienceYears: 5,
          education: 'B.Ed in Special Education - Cairo University',
          certifications: [
            { name: 'Registered Behavior Technician (RBT)', issuer: 'BACB', year: 2020 },
            { name: 'TEACCH Certified', issuer: 'UNC', year: 2021 },
          ],
          hourlyRate: 250,
          city: 'Cairo',
          district: 'Maadi',
          serviceRadiusKm: 15,
          isVerified: true,
          isAvailable: true,
          ratingAvg: 4.8,
          reviewCount: 24,
          availabilities: {
            create: [
              { dayOfWeek: 0, startTime: '09:00', endTime: '12:00' },
              { dayOfWeek: 0, startTime: '14:00', endTime: '17:00' },
              { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
              { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
              { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
              { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
              { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
              { dayOfWeek: 4, startTime: '14:00', endTime: '17:00' },
            ],
          },
        },
      },
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'mona@example.com' },
    update: {},
    create: {
      email: 'mona@example.com',
      password: teacherPassword,
      fullName: 'Mona Hassan',
      phone: '+201234567893',
      role: 'teacher',
      preferredLanguage: 'ar',
      teacherProfile: {
        create: {
          bioEn: 'Speech therapist and shadow teacher with 8 years of experience. Passionate about helping children find their voice and communicate effectively. I specialize in articulation disorders, language delays, and social communication challenges.',
          bioAr: 'أخصائية علاج نطق ومعلمة ظل مع 8 سنوات من الخبرة. شغوفة بمساعدة الأطفال على إيجاد صوتهم والتواصل بفعالية.',
          specializations: ['speech', 'developmental', 'social'] as Specialization[],
          experienceYears: 8,
          education: 'M.Sc in Speech-Language Pathology - Ain Shams University',
          certifications: [],
          hourlyRate: 350,
          city: 'Cairo',
          district: 'Heliopolis',
          serviceRadiusKm: 20,
          isVerified: true,
          isAvailable: true,
          ratingAvg: 4.9,
          reviewCount: 42,
          availabilities: {
            create: [
              { dayOfWeek: 0, startTime: '10:00', endTime: '13:00' },
              { dayOfWeek: 1, startTime: '10:00', endTime: '13:00' },
              { dayOfWeek: 2, startTime: '10:00', endTime: '13:00' },
              { dayOfWeek: 2, startTime: '15:00', endTime: '18:00' },
              { dayOfWeek: 3, startTime: '10:00', endTime: '13:00' },
              { dayOfWeek: 4, startTime: '10:00', endTime: '13:00' },
            ],
          },
        },
      },
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: {
      email: 'ahmed@example.com',
      password: teacherPassword,
      fullName: 'Ahmed Mostafa',
      phone: '+201234567894',
      role: 'teacher',
      preferredLanguage: 'en',
      teacherProfile: {
        create: {
          bioEn: 'Certified occupational therapist helping children develop fine motor skills and sensory processing abilities. Available for home visits.',
          bioAr: 'معالج وظيفي معتمد يساعد الأطفال على تطوير المهارات الحركية الدقيقة وقدرات المعالجة الحسية.',
          specializations: ['occupational', 'sensory', 'learning'] as Specialization[],
          experienceYears: 6,
          education: 'B.Sc in Occupational Therapy',
          certifications: [{ name: 'SIPT Certified', issuer: 'WPS', year: 2021 }],
          hourlyRate: 300,
          city: 'Cairo',
          district: 'Nasr City',
          serviceRadiusKm: 10,
          isVerified: false,
          isAvailable: true,
          ratingAvg: 4.5,
          reviewCount: 18,
          availabilities: {
            create: [
              { dayOfWeek: 0, startTime: '08:00', endTime: '11:00' },
              { dayOfWeek: 1, startTime: '08:00', endTime: '11:00' },
              { dayOfWeek: 3, startTime: '08:00', endTime: '11:00' },
              { dayOfWeek: 4, startTime: '08:00', endTime: '11:00' },
            ],
          },
        },
      },
    },
  });

  const teacher4 = await prisma.user.upsert({
    where: { email: 'fatma@example.com' },
    update: {},
    create: {
      email: 'fatma@example.com',
      password: teacherPassword,
      fullName: 'Fatma Ali',
      phone: '+201234567895',
      role: 'teacher',
      preferredLanguage: 'ar',
      teacherProfile: {
        create: {
          bioEn: 'Behavioral specialist with expertise in ABA therapy. I work closely with families to create positive learning environments.',
          bioAr: 'أخصائية سلوكية متخصصة في علاج ABA. أعمل عن كثب مع العائلات لخلق بيئات تعليمية إيجابية.',
          specializations: ['behavioral', 'autism', 'adhd'] as Specialization[],
          experienceYears: 4,
          education: 'M.A in Applied Behavior Analysis',
          certifications: [{ name: 'BCBA', issuer: 'BACB', year: 2022 }],
          hourlyRate: 400,
          city: 'Alexandria',
          district: 'Smouha',
          serviceRadiusKm: 25,
          isVerified: true,
          isAvailable: true,
          ratingAvg: 4.7,
          reviewCount: 31,
          availabilities: {
            create: [
              { dayOfWeek: 0, startTime: '09:00', endTime: '14:00' },
              { dayOfWeek: 1, startTime: '09:00', endTime: '14:00' },
              { dayOfWeek: 2, startTime: '09:00', endTime: '14:00' },
              { dayOfWeek: 3, startTime: '09:00', endTime: '14:00' },
              { dayOfWeek: 4, startTime: '09:00', endTime: '14:00' },
            ],
          },
        },
      },
    },
  });

  console.log('Created teachers:', teacher1.fullName, teacher2.fullName, teacher3.fullName, teacher4.fullName);

  // Create a sample booking
  const teacher1Profile = await prisma.teacherProfile.findUnique({
    where: { userId: teacher1.id },
  });

  if (teacher1Profile) {
    const booking = await prisma.booking.create({
      data: {
        parentId: parent1.id,
        teacherId: teacher1.id,
        status: 'confirmed',
        bookingDate: new Date('2026-01-20'),
        startTime: '09:00',
        endTime: '12:00',
        totalAmount: 250,
        notes: 'First session with my son. He has ADHD.',
      },
    });

    console.log('Created booking:', booking.id);

    // Create a review for the booking
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        parentId: parent1.id,
        teacherId: teacher1.id,
        rating: 5,
        comment: 'Sarah has been amazing with my son. He has made incredible progress in just a few months.',
      },
    });

    console.log('Created review:', review.id);
  }

  // Create a sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      parentId: parent1.id,
      teacherId: teacher1.id,
      messages: {
        create: [
          {
            senderId: parent1.id,
            content: 'Hi Sarah, I would like to book a session for my son who has ADHD.',
            messageType: 'text',
          },
          {
            senderId: teacher1.id,
            content: 'Hello! I would be happy to help. Can you tell me more about your son and his specific needs?',
            messageType: 'text',
          },
          {
            senderId: parent1.id,
            content: 'He is 7 years old and has difficulty focusing in class. His school suggested we get a shadow teacher.',
            messageType: 'text',
          },
        ],
      },
    },
  });

  console.log('Created conversation:', conversation.id);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
