import { PrismaClient, Specialization } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@liphant.com' },
    update: {},
    create: {
      email: 'admin@liphant.com',
      password: adminPassword,
      fullName: 'Liphant Admin',
      role: 'admin',
      preferredLanguage: 'en',
    },
  });
  console.log('Created admin:', admin.fullName);

  // Create forum categories
  const forumCategories = [
    { name: 'ADHD Support', nameAr: 'دعم ADHD', slug: 'adhd', description: 'Discuss strategies and experiences related to ADHD', icon: 'Brain', sortOrder: 1 },
    { name: 'Autism Resources', nameAr: 'موارد التوحد', slug: 'autism', description: 'Share resources and support for autism spectrum', icon: 'Puzzle', sortOrder: 2 },
    { name: 'Speech & Language', nameAr: 'النطق واللغة', slug: 'speech', description: 'Speech therapy tips and language development', icon: 'MessageSquare', sortOrder: 3 },
    { name: 'General Parenting', nameAr: 'الأبوة العامة', slug: 'general', description: 'General parenting discussions and support', icon: 'Heart', sortOrder: 4 },
    { name: 'School & Education', nameAr: 'المدرسة والتعليم', slug: 'education', description: 'School-related topics and IEP discussions', icon: 'GraduationCap', sortOrder: 5 },
    { name: 'Local Resources', nameAr: 'الموارد المحلية', slug: 'resources', description: 'Find and share local therapy centers and resources', icon: 'MapPin', sortOrder: 6 },
  ];

  for (const category of forumCategories) {
    await prisma.forumCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log('Created forum categories');

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

  // Create a sample conversation (check if exists first)
  let conversation = await prisma.conversation.findFirst({
    where: { parentId: parent1.id, teacherId: teacher1.id },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
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
  }

  console.log('Created conversation:', conversation.id);

  // Create center admin users with center profiles
  const centerPassword = await bcrypt.hash('password123', 12);

  const centerAdmin1 = await prisma.user.upsert({
    where: { email: 'center1@example.com' },
    update: {},
    create: {
      email: 'center1@example.com',
      password: centerPassword,
      fullName: 'Mahmoud El-Sayed',
      phone: '+201234567900',
      role: 'center_admin',
      preferredLanguage: 'en',
      centerProfile: {
        create: {
          nameEn: 'Bright Minds Therapy Center',
          nameAr: 'مركز العقول المشرقة للعلاج',
          descriptionEn: 'A leading therapy center specializing in comprehensive developmental support for children with ADHD, autism, and learning disabilities. Our team of qualified professionals provides individualized care in a warm, supportive environment.',
          descriptionAr: 'مركز علاج رائد متخصص في الدعم التنموي الشامل للأطفال المصابين بفرط الحركة والتوحد وصعوبات التعلم.',
          phone: '+201234567900',
          email: 'info@brightminds.eg',
          website: 'https://brightminds.eg',
          city: 'Cairo',
          district: 'Maadi',
          address: '15 Road 9, Maadi, Cairo',
          locationLat: 29.9602,
          locationLng: 31.2569,
          servicesOffered: [
            { nameEn: 'Speech Therapy', nameAr: 'علاج النطق', price: 300, duration: 60 },
            { nameEn: 'Occupational Therapy', nameAr: 'العلاج الوظيفي', price: 350, duration: 60 },
            { nameEn: 'ABA Therapy', nameAr: 'علاج ABA', price: 400, duration: 60 },
            { nameEn: 'Shadow Teaching', nameAr: 'معلم ظل', price: 250, duration: 180 },
          ],
          specializations: ['adhd', 'autism', 'speech', 'learning'] as Specialization[],
          operatingHours: {
            sunday: { open: '09:00', close: '18:00' },
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '15:00' },
          },
          isVerified: true,
        },
      },
    },
  });

  const centerAdmin2 = await prisma.user.upsert({
    where: { email: 'center2@example.com' },
    update: {},
    create: {
      email: 'center2@example.com',
      password: centerPassword,
      fullName: 'Nadia Khalil',
      phone: '+201234567901',
      role: 'center_admin',
      preferredLanguage: 'ar',
      centerProfile: {
        create: {
          nameEn: 'Hope Speech & Language Center',
          nameAr: 'مركز الأمل للنطق واللغة',
          descriptionEn: 'Specialized speech and language therapy center with certified therapists. We offer assessments, individual therapy, and group programs for children of all ages.',
          descriptionAr: 'مركز متخصص في علاج النطق واللغة مع معالجين معتمدين. نقدم التقييمات والعلاج الفردي والبرامج الجماعية للأطفال من جميع الأعمار.',
          phone: '+201234567901',
          email: 'info@hopespeech.eg',
          city: 'Cairo',
          district: 'Heliopolis',
          address: '25 El-Nozha Street, Heliopolis',
          locationLat: 30.0876,
          locationLng: 31.3234,
          servicesOffered: [
            { nameEn: 'Speech Therapy', nameAr: 'علاج النطق', price: 280, duration: 45 },
            { nameEn: 'Language Therapy', nameAr: 'علاج اللغة', price: 280, duration: 45 },
            { nameEn: 'Feeding Therapy', nameAr: 'علاج التغذية', price: 300, duration: 45 },
          ],
          specializations: ['speech', 'developmental'] as Specialization[],
          operatingHours: {
            sunday: { open: '10:00', close: '19:00' },
            monday: { open: '10:00', close: '19:00' },
            tuesday: { open: '10:00', close: '19:00' },
            wednesday: { open: '10:00', close: '19:00' },
            thursday: { open: '10:00', close: '17:00' },
          },
          isVerified: true,
        },
      },
    },
  });

  const centerAdmin3 = await prisma.user.upsert({
    where: { email: 'center3@example.com' },
    update: {},
    create: {
      email: 'center3@example.com',
      password: centerPassword,
      fullName: 'Karim Fawzy',
      phone: '+201234567902',
      role: 'center_admin',
      preferredLanguage: 'en',
      centerProfile: {
        create: {
          nameEn: 'Little Stars Learning Center',
          nameAr: 'مركز النجوم الصغيرة للتعلم',
          descriptionEn: 'A comprehensive learning center focused on early intervention and school readiness programs. We provide occupational therapy, sensory integration, and educational support.',
          descriptionAr: 'مركز تعليمي شامل يركز على التدخل المبكر وبرامج الاستعداد المدرسي.',
          phone: '+201234567902',
          email: 'info@littlestars.eg',
          city: 'Alexandria',
          district: 'Smouha',
          address: '8 Victor Emmanuel Street, Smouha',
          locationLat: 31.2156,
          locationLng: 29.9553,
          servicesOffered: [
            { nameEn: 'Occupational Therapy', nameAr: 'العلاج الوظيفي', price: 320, duration: 60 },
            { nameEn: 'Sensory Integration', nameAr: 'التكامل الحسي', price: 350, duration: 60 },
            { nameEn: 'Early Intervention', nameAr: 'التدخل المبكر', price: 300, duration: 60 },
            { nameEn: 'Shadow Teaching', nameAr: 'معلم ظل', price: 220, duration: 180 },
          ],
          specializations: ['sensory', 'occupational', 'learning', 'autism'] as Specialization[],
          operatingHours: {
            sunday: { open: '08:00', close: '17:00' },
            monday: { open: '08:00', close: '17:00' },
            tuesday: { open: '08:00', close: '17:00' },
            wednesday: { open: '08:00', close: '17:00' },
            thursday: { open: '08:00', close: '14:00' },
          },
          isVerified: false,
        },
      },
    },
  });

  console.log('Created centers:', centerAdmin1.fullName, centerAdmin2.fullName, centerAdmin3.fullName);

  // Create community events
  const event1 = await prisma.event.create({
    data: {
      title: 'ADHD Parents Support Group Meetup',
      description: 'Join us for a supportive gathering where parents of children with ADHD can share experiences, tips, and strategies. Light refreshments will be provided. This is a safe space to connect with other families going through similar journeys.',
      category: 'support_group',
      status: 'upcoming',
      startDate: new Date('2026-01-25T10:00:00'),
      endDate: new Date('2026-01-25T12:00:00'),
      locationName: 'Bright Minds Therapy Center',
      address: '15 Road 9, Maadi, Cairo',
      city: 'Cairo',
      district: 'Maadi',
      locationLat: 29.9602,
      locationLng: 31.2569,
      isOnline: false,
      maxAttendees: 20,
      organizerId: parent1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Sensory-Friendly Playdate at Al-Azhar Park',
      description: 'A relaxed playdate for children with sensory sensitivities and their families. We will have a designated quiet area and sensory-friendly activities. Siblings welcome!',
      category: 'playdate',
      status: 'upcoming',
      startDate: new Date('2026-02-01T15:00:00'),
      endDate: new Date('2026-02-01T18:00:00'),
      locationName: 'Al-Azhar Park - Family Area',
      address: 'Al-Azhar Park, Salah Salem Street',
      city: 'Cairo',
      district: 'Darb El-Ahmar',
      locationLat: 30.0398,
      locationLng: 31.2636,
      isOnline: false,
      maxAttendees: 15,
      organizerId: parent2.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Workshop: Understanding Your Child\'s IEP',
      description: 'Learn how to navigate the IEP process, understand your rights as a parent, and advocate effectively for your child\'s educational needs. Presented by education specialists.',
      category: 'workshop',
      status: 'upcoming',
      startDate: new Date('2026-02-10T17:00:00'),
      endDate: new Date('2026-02-10T19:00:00'),
      locationName: 'Online Event',
      city: 'Online',
      isOnline: true,
      onlineLink: 'https://zoom.us/j/example',
      maxAttendees: 50,
      organizerId: centerAdmin1.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Autism Awareness Family Fun Day',
      description: 'A fun-filled day for the whole family! Activities include arts and crafts, music therapy demos, games, and food. All activities are designed to be inclusive and accessible.',
      category: 'social',
      status: 'upcoming',
      startDate: new Date('2026-02-15T10:00:00'),
      endDate: new Date('2026-02-15T16:00:00'),
      locationName: 'Hope Speech & Language Center',
      address: '25 El-Nozha Street, Heliopolis',
      city: 'Cairo',
      district: 'Heliopolis',
      locationLat: 30.0876,
      locationLng: 31.3234,
      isOnline: false,
      maxAttendees: 40,
      organizerId: centerAdmin2.id,
    },
  });

  console.log('Created events:', event1.title, event2.title, event3.title, event4.title);

  // Add some event attendees
  await prisma.eventAttendee.createMany({
    data: [
      { eventId: event1.id, userId: parent1.id, status: 'going' },
      { eventId: event1.id, userId: parent2.id, status: 'going' },
      { eventId: event2.id, userId: parent1.id, status: 'maybe' },
      { eventId: event3.id, userId: parent2.id, status: 'going' },
      { eventId: event4.id, userId: parent1.id, status: 'going' },
      { eventId: event4.id, userId: parent2.id, status: 'going' },
    ],
  });

  console.log('Created event attendees');

  // Create forum posts
  const adhdCategory = await prisma.forumCategory.findUnique({ where: { slug: 'adhd' } });
  const autismCategory = await prisma.forumCategory.findUnique({ where: { slug: 'autism' } });
  const generalCategory = await prisma.forumCategory.findUnique({ where: { slug: 'general' } });

  if (adhdCategory && autismCategory && generalCategory) {
    const post1 = await prisma.forumPost.create({
      data: {
        title: 'Tips for managing homework time with ADHD child?',
        content: 'My 8-year-old son has ADHD and homework time has become a daily battle. He gets distracted easily and what should take 30 minutes often takes 2-3 hours. We\'ve tried timers and breaks but nothing seems to work consistently. Any suggestions from parents who have been through this?',
        categoryId: adhdCategory.id,
        authorId: parent1.id,
        viewCount: 156,
      },
    });

    // Add comments to post1
    await prisma.forumComment.createMany({
      data: [
        {
          content: 'We had the same issue! What helped us was breaking homework into very small chunks with movement breaks in between. Also, we moved homework time to right after school when he still has some focus left.',
          postId: post1.id,
          authorId: parent2.id,
        },
        {
          content: 'Have you tried fidget tools? My daughter does much better when she has something to squeeze or fidget with while working. Also, noise-canceling headphones were a game changer for us.',
          postId: post1.id,
          authorId: parent1.id,
        },
      ],
    });

    const post2 = await prisma.forumPost.create({
      data: {
        title: 'Looking for autism-friendly dentists in Cairo',
        content: 'Dental visits are extremely stressful for my autistic son. The bright lights, sounds, and unfamiliar environment trigger sensory overload. Does anyone know of dentists in Cairo who have experience with special needs children and can accommodate sensory sensitivities?',
        categoryId: autismCategory.id,
        authorId: parent2.id,
        viewCount: 89,
      },
    });

    await prisma.forumComment.create({
      data: {
        content: 'Dr. Mohamed Rashid in Maadi is wonderful with special needs kids. He lets families do practice visits before the actual appointment and uses a very gentle approach. His clinic number is 02-2345-6789.',
        postId: post2.id,
        authorId: parent1.id,
      },
    });

    const post3 = await prisma.forumPost.create({
      data: {
        title: 'How do you explain special needs to siblings?',
        content: 'My 6-year-old daughter has been asking why her younger brother acts differently and gets more attention. I want to explain autism to her in an age-appropriate way that helps her understand without making her feel less important. How have other parents handled this conversation?',
        categoryId: generalCategory.id,
        authorId: parent1.id,
        viewCount: 234,
        isPinned: true,
      },
    });

    console.log('Created forum posts:', post1.title, post2.title, post3.title);
  }

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
