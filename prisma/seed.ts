import { PrismaClient, Specialization, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with comprehensive test data...\n');

  const defaultPassword = await bcrypt.hash('Test@123456', 12);
  const adminPassword = await bcrypt.hash('Liphant@Admin2026!', 12);

  // ============================================
  // 1. CREATE ADMIN USER
  // ============================================
  console.log('Creating admin user...');
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
  console.log('  ✓ Admin:', admin.email);

  // ============================================
  // 2. CREATE PARENTS
  // ============================================
  console.log('\nCreating parents...');
  const parentsData = [
    {
      email: 'ahmed.hassan@example.com',
      fullName: 'Ahmed Hassan',
      phone: '+201001234567',
      preferredLanguage: 'ar' as const,
      profile: {
        childrenCount: 2,
        childrenAges: [6, 9],
        childrenConditions: ['adhd', 'autism'] as Specialization[],
        city: 'Cairo',
        district: 'Maadi',
        locationLat: 29.9602,
        locationLng: 31.2569,
      },
    },
    {
      email: 'sarah.mohamed@example.com',
      fullName: 'Sarah Mohamed',
      phone: '+201012345678',
      preferredLanguage: 'ar' as const,
      profile: {
        childrenCount: 1,
        childrenAges: [5],
        childrenConditions: ['speech', 'developmental'] as Specialization[],
        city: 'Cairo',
        district: 'Heliopolis',
        locationLat: 30.0866,
        locationLng: 31.3225,
      },
    },
    {
      email: 'john.smith@example.com',
      fullName: 'John Smith',
      phone: '+201023456789',
      preferredLanguage: 'en' as const,
      profile: {
        childrenCount: 1,
        childrenAges: [7],
        childrenConditions: ['learning', 'behavioral'] as Specialization[],
        city: 'Cairo',
        district: 'New Cairo',
        locationLat: 30.0131,
        locationLng: 31.4089,
      },
    },
    {
      email: 'fatma.ali@example.com',
      fullName: 'Fatma Ali',
      phone: '+201034567890',
      preferredLanguage: 'ar' as const,
      profile: {
        childrenCount: 3,
        childrenAges: [4, 8, 11],
        childrenConditions: ['autism', 'sensory', 'social'] as Specialization[],
        city: 'Alexandria',
        district: 'Smouha',
        locationLat: 31.2156,
        locationLng: 29.9553,
      },
    },
    {
      email: 'michael.brown@example.com',
      fullName: 'Michael Brown',
      phone: '+201045678901',
      preferredLanguage: 'en' as const,
      profile: {
        childrenCount: 2,
        childrenAges: [6, 10],
        childrenConditions: ['adhd', 'learning'] as Specialization[],
        city: 'Cairo',
        district: '6th of October',
        locationLat: 29.9285,
        locationLng: 30.9188,
      },
    },
  ];

  const parents = [];
  for (const data of parentsData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: defaultPassword,
        fullName: data.fullName,
        phone: data.phone,
        role: 'parent',
        preferredLanguage: data.preferredLanguage,
        parentProfile: {
          create: data.profile,
        },
      },
      include: { parentProfile: true },
    });
    parents.push(user);
    console.log('  ✓ Parent:', user.fullName);
  }

  // ============================================
  // 3. CREATE TEACHERS
  // ============================================
  console.log('\nCreating teachers...');
  const teachersData = [
    {
      email: 'dr.nadia.kamal@example.com',
      fullName: 'Dr. Nadia Kamal',
      phone: '+201111234567',
      preferredLanguage: 'ar' as const,
      profile: {
        bioEn: 'Experienced shadow teacher specializing in autism spectrum support with 10+ years of experience.',
        bioAr: 'معلمة ظل متخصصة في دعم طيف التوحد مع أكثر من 10 سنوات خبرة.',
        specializations: ['autism', 'behavioral', 'social'] as Specialization[],
        experienceYears: 10,
        education: 'PhD in Special Education - Cairo University',
        certifications: JSON.stringify([
          { name: 'ABA Certification', issuer: 'BACB', year: 2018 },
          { name: 'Autism Specialist', issuer: 'IBCCES', year: 2020 },
        ]),
        hourlyRate: 350,
        city: 'Cairo',
        district: 'Maadi',
        locationLat: 29.9602,
        locationLng: 31.2569,
        serviceRadiusKm: 15,
        isVerified: true,
        isAvailable: true,
        ratingAvg: 4.8,
        reviewCount: 25,
      },
    },
    {
      email: 'omar.ibrahim@example.com',
      fullName: 'Omar Ibrahim',
      phone: '+201122345678',
      preferredLanguage: 'ar' as const,
      profile: {
        bioEn: 'Speech therapist and shadow teacher with expertise in language development and communication disorders.',
        bioAr: 'معالج نطق ومعلم ظل متخصص في تطوير اللغة واضطرابات التواصل.',
        specializations: ['speech', 'developmental', 'learning'] as Specialization[],
        experienceYears: 7,
        education: 'Masters in Speech-Language Pathology - Ain Shams University',
        certifications: JSON.stringify([
          { name: 'Speech Therapy License', issuer: 'MOH Egypt', year: 2017 },
        ]),
        hourlyRate: 280,
        city: 'Cairo',
        district: 'Heliopolis',
        locationLat: 30.0866,
        locationLng: 31.3225,
        serviceRadiusKm: 20,
        isVerified: true,
        isAvailable: true,
        ratingAvg: 4.6,
        reviewCount: 18,
      },
    },
    {
      email: 'emma.wilson@example.com',
      fullName: 'Emma Wilson',
      phone: '+201133456789',
      preferredLanguage: 'en' as const,
      profile: {
        bioEn: 'International certified shadow teacher with expertise in ADHD and executive functioning support.',
        bioAr: 'معلمة ظل معتمدة دولياً متخصصة في دعم فرط الحركة والوظائف التنفيذية.',
        specializations: ['adhd', 'learning', 'behavioral'] as Specialization[],
        experienceYears: 8,
        education: 'MEd in Special Education - University of London',
        certifications: JSON.stringify([
          { name: 'ADHD Specialist', issuer: 'CHADD', year: 2019 },
          { name: 'Executive Function Coach', issuer: 'PESI', year: 2021 },
        ]),
        hourlyRate: 400,
        city: 'Cairo',
        district: 'New Cairo',
        locationLat: 30.0131,
        locationLng: 31.4089,
        serviceRadiusKm: 25,
        isVerified: true,
        isAvailable: true,
        ratingAvg: 4.9,
        reviewCount: 32,
      },
    },
    {
      email: 'mona.adel@example.com',
      fullName: 'Mona Adel',
      phone: '+201144567890',
      preferredLanguage: 'ar' as const,
      profile: {
        bioEn: 'Occupational therapist specializing in sensory processing and fine motor skill development.',
        bioAr: 'معالجة وظيفية متخصصة في المعالجة الحسية وتطوير المهارات الحركية الدقيقة.',
        specializations: ['occupational', 'sensory', 'developmental'] as Specialization[],
        experienceYears: 6,
        education: 'BSc in Occupational Therapy - Cairo University',
        certifications: JSON.stringify([
          { name: 'Sensory Integration Certification', issuer: 'USC/WPS', year: 2020 },
        ]),
        hourlyRate: 300,
        city: 'Cairo',
        district: '6th of October',
        locationLat: 29.9285,
        locationLng: 30.9188,
        serviceRadiusKm: 15,
        isVerified: true,
        isAvailable: true,
        ratingAvg: 4.7,
        reviewCount: 15,
      },
    },
    {
      email: 'youssef.magdy@example.com',
      fullName: 'Youssef Magdy',
      phone: '+201155678901',
      preferredLanguage: 'ar' as const,
      profile: {
        bioEn: 'Behavioral therapist focusing on social skills development and behavioral interventions.',
        bioAr: 'معالج سلوكي يركز على تطوير المهارات الاجتماعية والتدخلات السلوكية.',
        specializations: ['behavioral', 'social', 'autism'] as Specialization[],
        experienceYears: 5,
        education: 'Masters in Clinical Psychology - Alexandria University',
        certifications: JSON.stringify([
          { name: 'RBT Certification', issuer: 'BACB', year: 2021 },
        ]),
        hourlyRate: 250,
        city: 'Alexandria',
        district: 'Smouha',
        locationLat: 31.2156,
        locationLng: 29.9553,
        serviceRadiusKm: 20,
        isVerified: true,
        isAvailable: true,
        ratingAvg: 4.5,
        reviewCount: 12,
      },
    },
    {
      email: 'layla.hassan@example.com',
      fullName: 'Layla Hassan',
      phone: '+201166789012',
      preferredLanguage: 'ar' as const,
      profile: {
        bioEn: 'Experienced special education teacher with focus on learning disabilities and academic support.',
        bioAr: 'معلمة تعليم خاص ذات خبرة مع التركيز على صعوبات التعلم والدعم الأكاديمي.',
        specializations: ['learning', 'adhd', 'developmental'] as Specialization[],
        experienceYears: 9,
        education: 'MEd in Learning Disabilities - Helwan University',
        certifications: JSON.stringify([
          { name: 'Wilson Reading System', issuer: 'Wilson Language', year: 2019 },
          { name: 'Orton-Gillingham Certified', issuer: 'OGA', year: 2020 },
        ]),
        hourlyRate: 320,
        city: 'Cairo',
        district: 'Nasr City',
        locationLat: 30.0511,
        locationLng: 31.3656,
        serviceRadiusKm: 15,
        isVerified: false, // Not yet verified
        isAvailable: true,
        ratingAvg: 0,
        reviewCount: 0,
      },
    },
  ];

  const teachers = [];
  for (const data of teachersData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: defaultPassword,
        fullName: data.fullName,
        phone: data.phone,
        role: 'teacher',
        preferredLanguage: data.preferredLanguage,
        teacherProfile: {
          create: {
            ...data.profile,
            certifications: data.profile.certifications,
          },
        },
      },
      include: { teacherProfile: true },
    });
    teachers.push(user);
    console.log('  ✓ Teacher:', user.fullName, data.profile.isVerified ? '(verified)' : '(pending)');
  }

  // ============================================
  // 4. CREATE THERAPY CENTERS
  // ============================================
  console.log('\nCreating therapy centers...');
  const centersData = [
    {
      email: 'info@hopecenter.eg',
      fullName: 'Hope Center Admin',
      phone: '+201201234567',
      preferredLanguage: 'en' as const,
      profile: {
        nameEn: 'Hope Therapy Center',
        nameAr: 'مركز الأمل للعلاج',
        descriptionEn: 'A comprehensive therapy center offering speech, occupational, and behavioral therapy services.',
        descriptionAr: 'مركز علاج شامل يقدم خدمات علاج النطق والعلاج الوظيفي والعلاج السلوكي.',
        specializations: ['speech', 'occupational', 'behavioral', 'autism'] as Specialization[],
        servicesOffered: JSON.stringify([
          { nameEn: 'Speech Therapy', nameAr: 'علاج النطق', price: 400, duration: 45 },
          { nameEn: 'Occupational Therapy', nameAr: 'العلاج الوظيفي', price: 350, duration: 45 },
          { nameEn: 'ABA Therapy', nameAr: 'العلاج السلوكي', price: 450, duration: 60 },
        ]),
        city: 'Cairo',
        district: 'Maadi',
        address: '15 Road 9, Maadi, Cairo',
        locationLat: 29.9602,
        locationLng: 31.2569,
        phone: '+201201234567',
        email: 'contact@hopecenter.eg',
        website: 'https://hopecenter.eg',
        operatingHours: JSON.stringify({
          sunday: { open: '09:00', close: '18:00' },
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
        }),
        isVerified: true,
        isActive: true,
        ratingAvg: 4.7,
        reviewCount: 45,
        foundedYear: 2015,
        licenseNumber: 'MOH-2015-1234',
      },
    },
    {
      email: 'admin@brightminds.eg',
      fullName: 'Bright Minds Admin',
      phone: '+201212345678',
      preferredLanguage: 'ar' as const,
      profile: {
        nameEn: 'Bright Minds Development Center',
        nameAr: 'مركز العقول المشرقة للتنمية',
        descriptionEn: 'Specialized in early intervention and developmental support for children with special needs.',
        descriptionAr: 'متخصصون في التدخل المبكر ودعم نمو الأطفال ذوي الاحتياجات الخاصة.',
        specializations: ['developmental', 'autism', 'adhd', 'learning'] as Specialization[],
        servicesOffered: JSON.stringify([
          { nameEn: 'Early Intervention', nameAr: 'التدخل المبكر', price: 500, duration: 60 },
          { nameEn: 'Social Skills Group', nameAr: 'مجموعة المهارات الاجتماعية', price: 300, duration: 90 },
          { nameEn: 'Parent Training', nameAr: 'تدريب الآباء', price: 350, duration: 60 },
        ]),
        city: 'Cairo',
        district: 'New Cairo',
        address: 'Mall of Arabia Extension, New Cairo',
        locationLat: 30.0131,
        locationLng: 31.4089,
        phone: '+201212345678',
        email: 'info@brightminds.eg',
        website: 'https://brightminds.eg',
        operatingHours: JSON.stringify({
          saturday: { open: '10:00', close: '17:00' },
          sunday: { open: '09:00', close: '19:00' },
          monday: { open: '09:00', close: '19:00' },
          tuesday: { open: '09:00', close: '19:00' },
          wednesday: { open: '09:00', close: '19:00' },
          thursday: { open: '09:00', close: '19:00' },
        }),
        isVerified: true,
        isActive: true,
        ratingAvg: 4.5,
        reviewCount: 28,
        foundedYear: 2018,
        licenseNumber: 'MOH-2018-5678',
      },
    },
    {
      email: 'manager@alextherapy.eg',
      fullName: 'Alex Therapy Admin',
      phone: '+201223456789',
      preferredLanguage: 'ar' as const,
      profile: {
        nameEn: 'Alexandria Therapy Hub',
        nameAr: 'مركز الإسكندرية للعلاج',
        descriptionEn: 'The leading therapy center in Alexandria offering comprehensive services.',
        descriptionAr: 'مركز العلاج الرائد في الإسكندرية يقدم خدمات شاملة.',
        specializations: ['speech', 'sensory', 'social', 'behavioral'] as Specialization[],
        servicesOffered: JSON.stringify([
          { nameEn: 'Speech Therapy', nameAr: 'علاج النطق', price: 350, duration: 45 },
          { nameEn: 'Sensory Integration', nameAr: 'التكامل الحسي', price: 400, duration: 60 },
        ]),
        city: 'Alexandria',
        district: 'Smouha',
        address: '25 Victor Emanuel St, Smouha, Alexandria',
        locationLat: 31.2156,
        locationLng: 29.9553,
        phone: '+201223456789',
        email: 'contact@alextherapy.eg',
        operatingHours: JSON.stringify({
          sunday: { open: '10:00', close: '18:00' },
          monday: { open: '10:00', close: '18:00' },
          tuesday: { open: '10:00', close: '18:00' },
          wednesday: { open: '10:00', close: '18:00' },
          thursday: { open: '10:00', close: '18:00' },
        }),
        isVerified: false, // Pending verification
        isActive: true,
        ratingAvg: 0,
        reviewCount: 0,
        foundedYear: 2022,
      },
    },
  ];

  const centers = [];
  for (const data of centersData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: defaultPassword,
        fullName: data.fullName,
        phone: data.phone,
        role: 'center_admin',
        preferredLanguage: data.preferredLanguage,
        centerProfile: {
          create: data.profile,
        },
      },
      include: { centerProfile: true },
    });
    centers.push(user);
    console.log('  ✓ Center:', data.profile.nameEn, data.profile.isVerified ? '(verified)' : '(pending)');
  }

  // ============================================
  // 5. CREATE BOOKINGS
  // ============================================
  console.log('\nCreating bookings...');

  const today = new Date();
  const bookingsData = [
    // Completed bookings (for testing session notes)
    { parentIdx: 0, teacherIdx: 0, daysAgo: 7, status: 'completed' as BookingStatus, startTime: '10:00', endTime: '11:00', amount: 350 },
    { parentIdx: 0, teacherIdx: 0, daysAgo: 14, status: 'completed' as BookingStatus, startTime: '10:00', endTime: '11:00', amount: 350 },
    { parentIdx: 0, teacherIdx: 1, daysAgo: 5, status: 'completed' as BookingStatus, startTime: '14:00', endTime: '15:00', amount: 280 },
    { parentIdx: 1, teacherIdx: 1, daysAgo: 3, status: 'completed' as BookingStatus, startTime: '09:00', endTime: '10:00', amount: 280 },
    { parentIdx: 1, teacherIdx: 2, daysAgo: 10, status: 'completed' as BookingStatus, startTime: '11:00', endTime: '12:00', amount: 400 },
    { parentIdx: 2, teacherIdx: 2, daysAgo: 2, status: 'completed' as BookingStatus, startTime: '15:00', endTime: '16:00', amount: 400 },
    { parentIdx: 2, teacherIdx: 3, daysAgo: 8, status: 'completed' as BookingStatus, startTime: '10:00', endTime: '11:00', amount: 300 },
    { parentIdx: 3, teacherIdx: 4, daysAgo: 4, status: 'completed' as BookingStatus, startTime: '16:00', endTime: '17:00', amount: 250 },
    { parentIdx: 4, teacherIdx: 0, daysAgo: 6, status: 'completed' as BookingStatus, startTime: '09:00', endTime: '10:00', amount: 350 },
    { parentIdx: 4, teacherIdx: 2, daysAgo: 12, status: 'completed' as BookingStatus, startTime: '14:00', endTime: '15:00', amount: 400 },

    // Confirmed bookings (upcoming)
    { parentIdx: 0, teacherIdx: 0, daysAgo: -3, status: 'confirmed' as BookingStatus, startTime: '10:00', endTime: '11:00', amount: 350 },
    { parentIdx: 1, teacherIdx: 1, daysAgo: -5, status: 'confirmed' as BookingStatus, startTime: '11:00', endTime: '12:00', amount: 280 },
    { parentIdx: 2, teacherIdx: 2, daysAgo: -7, status: 'confirmed' as BookingStatus, startTime: '14:00', endTime: '15:00', amount: 400 },
    { parentIdx: 3, teacherIdx: 3, daysAgo: -2, status: 'confirmed' as BookingStatus, startTime: '09:00', endTime: '10:00', amount: 300 },

    // Pending bookings
    { parentIdx: 0, teacherIdx: 2, daysAgo: -10, status: 'pending' as BookingStatus, startTime: '15:00', endTime: '16:00', amount: 400 },
    { parentIdx: 1, teacherIdx: 0, daysAgo: -8, status: 'pending' as BookingStatus, startTime: '10:00', endTime: '11:00', amount: 350 },
    { parentIdx: 4, teacherIdx: 3, daysAgo: -4, status: 'pending' as BookingStatus, startTime: '11:00', endTime: '12:00', amount: 300 },

    // Cancelled booking
    { parentIdx: 2, teacherIdx: 1, daysAgo: 1, status: 'cancelled' as BookingStatus, startTime: '10:00', endTime: '11:00', amount: 280 },
  ];

  const bookings = [];
  for (const data of bookingsData) {
    const bookingDate = new Date(today);
    bookingDate.setDate(bookingDate.getDate() - data.daysAgo);

    const booking = await prisma.booking.create({
      data: {
        parentId: parents[data.parentIdx].id,
        teacherId: teachers[data.teacherIdx].id,
        status: data.status,
        bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        totalAmount: data.amount,
        notes: data.status === 'pending' ? 'Looking forward to this session!' : null,
      },
    });
    bookings.push(booking);
  }
  console.log(`  ✓ Created ${bookings.length} bookings`);

  // ============================================
  // 6. CREATE SESSION NOTES
  // ============================================
  console.log('\nCreating session notes...');

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const sessionNotesData = [
    // Notes for various completed bookings
    { bookingIdx: 0, authorType: 'teacher', content: 'Great progress today! Child showed improved focus during activities. Worked on eye contact and turn-taking.', isPrivate: false },
    { bookingIdx: 0, authorType: 'parent', content: 'Thank you for the session. We noticed improvement at home too!', isPrivate: false },
    { bookingIdx: 0, authorType: 'teacher', content: 'Internal note: Consider introducing more sensory breaks next session.', isPrivate: true },

    { bookingIdx: 1, authorType: 'teacher', content: 'Continued work on social skills. Child participated well in group activities simulation.', isPrivate: false },
    { bookingIdx: 1, authorType: 'parent', content: 'Child was very happy after the session. Keep up the great work!', isPrivate: false },

    { bookingIdx: 2, authorType: 'teacher', content: 'Speech articulation exercises completed. Working on "s" and "r" sounds.', isPrivate: false },
    { bookingIdx: 2, authorType: 'teacher', content: 'Note to self: Send parent home exercises sheet.', isPrivate: true },

    { bookingIdx: 3, authorType: 'teacher', content: 'Good session focusing on language comprehension. Child followed 2-step instructions well.', isPrivate: false },

    { bookingIdx: 4, authorType: 'teacher', content: 'ADHD management strategies reviewed. Introduced timer technique for task completion.', isPrivate: false },
    { bookingIdx: 4, authorType: 'parent', content: 'We tried the timer at home - it works really well!', isPrivate: false },

    { bookingIdx: 5, authorType: 'teacher', content: 'Continued with executive function exercises. Good improvement in planning tasks.', isPrivate: false },

    { bookingIdx: 6, authorType: 'teacher', content: 'Sensory integration session. Worked on proprioceptive activities.', isPrivate: false },
    { bookingIdx: 6, authorType: 'parent', content: 'Child seemed calmer after the session. Very helpful!', isPrivate: false },

    { bookingIdx: 7, authorType: 'teacher', content: 'Social skills practice with role-playing scenarios. Good progress!', isPrivate: false },

    { bookingIdx: 8, authorType: 'teacher', content: 'First session with this family. Assessment completed. Created treatment plan.', isPrivate: false },
    { bookingIdx: 8, authorType: 'teacher', content: 'Family history notes - see assessment form for details.', isPrivate: true },

    { bookingIdx: 9, authorType: 'teacher', content: 'Review session. Discussed progress and adjusted goals for next quarter.', isPrivate: false },
    { bookingIdx: 9, authorType: 'parent', content: 'Very comprehensive review. Thank you for the detailed feedback.', isPrivate: false },
  ];

  for (const data of sessionNotesData) {
    const booking = completedBookings[data.bookingIdx];
    if (!booking) continue;

    const authorId = data.authorType === 'teacher' ? booking.teacherId : booking.parentId;
    if (!authorId) continue; // Skip if no teacher assigned

    await prisma.sessionNote.create({
      data: {
        bookingId: booking.id,
        authorId,
        content: data.content,
        isPrivate: data.isPrivate,
      },
    });
  }
  console.log(`  ✓ Created ${sessionNotesData.length} session notes`);

  // ============================================
  // 7. CREATE SESSION DOCUMENTS
  // ============================================
  console.log('\nCreating session documents...');

  const sessionDocumentsData = [
    { bookingIdx: 0, uploaderType: 'teacher', name: 'Progress Report - Week 1', fileUrl: 'https://example.com/docs/progress-report-1.pdf', fileType: 'application/pdf', fileSize: 245000, isPrivate: false },
    { bookingIdx: 0, uploaderType: 'teacher', name: 'Activity Worksheet', fileUrl: 'https://example.com/docs/worksheet-1.pdf', fileType: 'application/pdf', fileSize: 125000, isPrivate: false },
    { bookingIdx: 1, uploaderType: 'teacher', name: 'Social Skills Checklist', fileUrl: 'https://example.com/docs/checklist.pdf', fileType: 'application/pdf', fileSize: 89000, isPrivate: false },
    { bookingIdx: 2, uploaderType: 'teacher', name: 'Speech Exercise Sheet', fileUrl: 'https://example.com/docs/speech-exercises.pdf', fileType: 'application/pdf', fileSize: 156000, isPrivate: false },
    { bookingIdx: 2, uploaderType: 'parent', name: 'Home Practice Video', fileUrl: 'https://example.com/docs/home-practice.mp4', fileType: 'video/mp4', fileSize: 5200000, isPrivate: false },
    { bookingIdx: 4, uploaderType: 'teacher', name: 'ADHD Strategy Guide', fileUrl: 'https://example.com/docs/adhd-guide.pdf', fileType: 'application/pdf', fileSize: 320000, isPrivate: false },
    { bookingIdx: 6, uploaderType: 'teacher', name: 'Sensory Diet Plan', fileUrl: 'https://example.com/docs/sensory-diet.pdf', fileType: 'application/pdf', fileSize: 210000, isPrivate: false },
    { bookingIdx: 8, uploaderType: 'teacher', name: 'Initial Assessment Report', fileUrl: 'https://example.com/docs/assessment.pdf', fileType: 'application/pdf', fileSize: 450000, isPrivate: false },
    { bookingIdx: 8, uploaderType: 'teacher', name: 'Treatment Plan', fileUrl: 'https://example.com/docs/treatment-plan.pdf', fileType: 'application/pdf', fileSize: 280000, isPrivate: true },
    { bookingIdx: 9, uploaderType: 'teacher', name: 'Quarterly Progress Summary', fileUrl: 'https://example.com/docs/quarterly-summary.pdf', fileType: 'application/pdf', fileSize: 380000, isPrivate: false },
  ];

  for (const data of sessionDocumentsData) {
    const booking = completedBookings[data.bookingIdx];
    if (!booking) continue;

    const uploaderId = data.uploaderType === 'teacher' ? booking.teacherId : booking.parentId;
    if (!uploaderId) continue; // Skip if no teacher assigned

    await prisma.sessionDocument.create({
      data: {
        bookingId: booking.id,
        uploadedById: uploaderId,
        name: data.name,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        isPrivate: data.isPrivate,
      },
    });
  }
  console.log(`  ✓ Created ${sessionDocumentsData.length} session documents`);

  // ============================================
  // 8. CREATE REVIEWS
  // ============================================
  console.log('\nCreating reviews...');

  const reviewsData = [
    { bookingIdx: 0, rating: 5, comment: 'Excellent teacher! Very patient and knowledgeable. Our child loves the sessions.' },
    { bookingIdx: 1, rating: 5, comment: 'Great progress in just a few sessions. Highly recommended!' },
    { bookingIdx: 3, rating: 4, comment: 'Good session, child enjoyed the activities. Would appreciate more feedback.' },
    { bookingIdx: 4, rating: 5, comment: 'Amazing ADHD specialist. Strategies really work!' },
    { bookingIdx: 5, rating: 5, comment: 'Very professional and effective. Seeing real improvement.' },
    { bookingIdx: 6, rating: 4, comment: 'Helpful session. Child was calm and engaged throughout.' },
    { bookingIdx: 8, rating: 5, comment: 'Thorough assessment. Felt very supported and informed.' },
  ];

  for (const data of reviewsData) {
    const booking = completedBookings[data.bookingIdx];
    if (!booking || !booking.teacherId) continue; // Skip if no teacher assigned

    await prisma.review.create({
      data: {
        bookingId: booking.id,
        parentId: booking.parentId,
        teacherId: booking.teacherId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }
  console.log(`  ✓ Created ${reviewsData.length} reviews`);

  // ============================================
  // 9. CREATE CONVERSATIONS & MESSAGES
  // ============================================
  console.log('\nCreating conversations and messages...');

  const conversationsData = [
    { parentIdx: 0, teacherIdx: 0 },
    { parentIdx: 0, teacherIdx: 1 },
    { parentIdx: 1, teacherIdx: 1 },
    { parentIdx: 1, teacherIdx: 2 },
    { parentIdx: 2, teacherIdx: 2 },
  ];

  for (const data of conversationsData) {
    const conversation = await prisma.conversation.create({
      data: {
        parentId: parents[data.parentIdx].id,
        teacherId: teachers[data.teacherIdx].id,
      },
    });

    // Add some messages
    const messages = [
      { senderId: parents[data.parentIdx].id, content: 'Hello! I would like to inquire about your services.' },
      { senderId: teachers[data.teacherIdx].id, content: 'Hello! Thank you for reaching out. I would be happy to help. What specific support are you looking for?' },
      { senderId: parents[data.parentIdx].id, content: 'My child needs help with focus and attention during school.' },
      { senderId: teachers[data.teacherIdx].id, content: 'I specialize in that area. Let me share some information about my approach.' },
    ];

    for (const msg of messages) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: msg.senderId,
          content: msg.content,
        },
      });
    }
  }
  console.log(`  ✓ Created ${conversationsData.length} conversations with messages`);

  // ============================================
  // 10. CREATE FORUM CATEGORIES
  // ============================================
  console.log('\nCreating forum categories...');
  const forumCategories = [
    { name: 'ADHD Support', nameAr: 'دعم فرط الحركة', slug: 'adhd', description: 'Discuss strategies, experiences, and resources related to ADHD', icon: 'Brain', sortOrder: 1 },
    { name: 'Autism Spectrum', nameAr: 'طيف التوحد', slug: 'autism', description: 'Share resources, support, and experiences for autism spectrum', icon: 'Puzzle', sortOrder: 2 },
    { name: 'Speech & Language', nameAr: 'النطق واللغة', slug: 'speech', description: 'Speech therapy tips, language development, and communication strategies', icon: 'MessageSquare', sortOrder: 3 },
    { name: 'Occupational Therapy', nameAr: 'العلاج الوظيفي', slug: 'occupational', description: 'Fine motor skills, sensory processing, and daily living activities', icon: 'Hand', sortOrder: 4 },
    { name: 'School & Education', nameAr: 'المدرسة والتعليم', slug: 'education', description: 'School-related topics, IEP discussions, and educational resources', icon: 'GraduationCap', sortOrder: 5 },
    { name: 'Parenting Tips', nameAr: 'نصائح الأبوة', slug: 'parenting', description: 'General parenting discussions, tips, and emotional support', icon: 'Heart', sortOrder: 6 },
    { name: 'Local Resources', nameAr: 'الموارد المحلية', slug: 'resources', description: 'Find and share local therapy centers, doctors, and services', icon: 'MapPin', sortOrder: 7 },
    { name: 'Success Stories', nameAr: 'قصص النجاح', slug: 'success', description: 'Share milestones, achievements, and inspiring stories', icon: 'Star', sortOrder: 8 },
  ];

  const categories = [];
  for (const category of forumCategories) {
    const cat = await prisma.forumCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, nameAr: category.nameAr, description: category.description, icon: category.icon, sortOrder: category.sortOrder },
      create: category,
    });
    categories.push(cat);
  }
  console.log(`  ✓ Created ${forumCategories.length} forum categories`);

  // ============================================
  // 11. CREATE FORUM POSTS & COMMENTS
  // ============================================
  console.log('\nCreating forum posts and comments...');

  const postsData = [
    { categorySlug: 'adhd', authorIdx: 0, title: 'Tips for homework time with ADHD child', content: 'Hi everyone! My son struggles with homework every day. Any tips that worked for you?' },
    { categorySlug: 'adhd', authorIdx: 2, title: 'Best apps for ADHD kids', content: 'Looking for recommendations on educational apps that help with focus and organization.' },
    { categorySlug: 'autism', authorIdx: 0, title: 'Social skills groups in Cairo', content: 'Does anyone know of good social skills groups for autistic children in Cairo?' },
    { categorySlug: 'speech', authorIdx: 1, title: 'Home exercises for speech delay', content: 'Our speech therapist gave us some exercises. Happy to share what works for us!' },
    { categorySlug: 'success', authorIdx: 3, title: 'First full sentence!', content: 'After 6 months of speech therapy, my daughter said her first full sentence today! So proud!' },
    { categorySlug: 'parenting', authorIdx: 4, title: 'Self-care for special needs parents', content: 'How do you all take care of yourselves while caring for your special needs children?' },
  ];

  for (const postData of postsData) {
    const category = categories.find(c => c.slug === postData.categorySlug);
    if (!category) continue;

    const post = await prisma.forumPost.create({
      data: {
        categoryId: category.id,
        authorId: parents[postData.authorIdx].id,
        title: postData.title,
        content: postData.content,
      },
    });

    // Add some comments
    const otherParentIdx = (postData.authorIdx + 1) % parents.length;
    await prisma.forumComment.create({
      data: {
        postId: post.id,
        authorId: parents[otherParentIdx].id,
        content: 'Thanks for sharing! This is really helpful.',
      },
    });
  }
  console.log(`  ✓ Created ${postsData.length} forum posts with comments`);

  // ============================================
  // 12. CREATE COMMUNITY EVENTS
  // ============================================
  console.log('\nCreating community events...');

  const eventsData = [
    {
      organizerIdx: 0,
      title: 'Autism Awareness Playdate',
      description: 'A fun playdate for children on the autism spectrum. Activities will include sensory play, art, and social games.',
      category: 'playdate' as const,
      status: 'upcoming' as const,
      daysFromNow: 7,
      locationName: 'Maadi Community Park',
      city: 'Cairo',
      district: 'Maadi',
      maxAttendees: 15,
    },
    {
      organizerIdx: 1,
      title: 'ADHD Parent Support Group',
      description: 'Monthly meeting for parents of children with ADHD. Share experiences, strategies, and support each other.',
      category: 'support_group' as const,
      status: 'upcoming' as const,
      daysFromNow: 14,
      locationName: 'Hope Therapy Center',
      city: 'Cairo',
      district: 'Maadi',
      address: '15 Road 9, Maadi',
      maxAttendees: 20,
    },
    {
      organizerIdx: 2,
      title: 'Speech Development Workshop',
      description: 'Learn practical techniques to support your child\'s speech development at home.',
      category: 'workshop' as const,
      status: 'upcoming' as const,
      daysFromNow: 21,
      locationName: 'Online via Zoom',
      city: 'Cairo',
      isOnline: true,
      onlineLink: 'https://zoom.us/j/example',
      maxAttendees: 50,
    },
    {
      organizerIdx: 3,
      title: 'Special Needs Family Picnic',
      description: 'A relaxed outdoor gathering for families with special needs children. Bring your own food and enjoy the afternoon!',
      category: 'social' as const,
      status: 'upcoming' as const,
      daysFromNow: 10,
      locationName: 'Al-Azhar Park',
      city: 'Cairo',
      district: 'Al-Darb Al-Ahmar',
      maxAttendees: 30,
    },
  ];

  for (const eventData of eventsData) {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + eventData.daysFromNow);
    startDate.setHours(10, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(13, 0, 0, 0);

    const event = await prisma.event.create({
      data: {
        organizerId: parents[eventData.organizerIdx].id,
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        status: eventData.status,
        startDate,
        endDate,
        locationName: eventData.locationName,
        city: eventData.city,
        district: eventData.district,
        address: eventData.address,
        isOnline: eventData.isOnline || false,
        onlineLink: eventData.onlineLink,
        maxAttendees: eventData.maxAttendees,
      },
    });

    // Add some RSVPs
    const attendeeIdx = (eventData.organizerIdx + 1) % parents.length;
    await prisma.eventAttendee.create({
      data: {
        eventId: event.id,
        userId: parents[attendeeIdx].id,
        status: 'going',
      },
    });
  }
  console.log(`  ✓ Created ${eventsData.length} community events`);

  // ============================================
  // 13. CREATE TEACHER AVAILABILITY
  // ============================================
  console.log('\nCreating teacher availability...');

  for (const teacher of teachers) {
    if (!teacher.teacherProfile) continue;

    // Add availability for weekdays
    const days = [0, 1, 2, 3, 4]; // Sunday to Thursday
    for (const day of days) {
      await prisma.availability.create({
        data: {
          teacherId: teacher.teacherProfile.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '12:00',
          isRecurring: true,
        },
      });
      await prisma.availability.create({
        data: {
          teacherId: teacher.teacherProfile.id,
          dayOfWeek: day,
          startTime: '14:00',
          endTime: '18:00',
          isRecurring: true,
        },
      });
    }
  }
  console.log(`  ✓ Created availability for ${teachers.length} teachers`);

  // ============================================
  // 14. LINK TEACHERS TO CENTERS
  // ============================================
  console.log('\nLinking teachers to centers...');

  // Link first 2 teachers to Hope Center
  const hopeCenterProfile = centers[0].centerProfile;
  if (hopeCenterProfile && teachers[0].teacherProfile && teachers[1].teacherProfile) {
    await prisma.centerTeacher.create({
      data: {
        centerId: hopeCenterProfile.id,
        teacherId: teachers[0].teacherProfile.id,
        role: 'lead',
        employmentType: 'full_time',
        isActive: true,
        canManageBookings: true,
      },
    });
    await prisma.centerTeacher.create({
      data: {
        centerId: hopeCenterProfile.id,
        teacherId: teachers[1].teacherProfile.id,
        role: 'staff',
        employmentType: 'part_time',
        isActive: true,
        canManageBookings: false,
      },
    });
  }

  // Link teacher 2 and 3 to Bright Minds
  const brightMindsProfile = centers[1].centerProfile;
  if (brightMindsProfile && teachers[2].teacherProfile && teachers[3].teacherProfile) {
    await prisma.centerTeacher.create({
      data: {
        centerId: brightMindsProfile.id,
        teacherId: teachers[2].teacherProfile.id,
        role: 'manager',
        employmentType: 'full_time',
        isActive: true,
        canManageBookings: true,
      },
    });
    await prisma.centerTeacher.create({
      data: {
        centerId: brightMindsProfile.id,
        teacherId: teachers[3].teacherProfile.id,
        role: 'staff',
        employmentType: 'contract',
        isActive: true,
        canManageBookings: false,
      },
    });
  }
  console.log('  ✓ Linked teachers to centers');

  // ============================================
  // 15. CREATE CENTER SERVICES
  // ============================================
  console.log('\nCreating center services...');

  const centerServicesData: {
    centerIdx: number;
    services: { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; price: number; duration: number }[];
  }[] = [
    {
      centerIdx: 0, // Hope Center
      services: [
        { nameEn: 'Speech Therapy', nameAr: 'علاج النطق', descriptionEn: 'Professional speech therapy sessions to improve communication skills.', descriptionAr: 'جلسات علاج النطق المتخصصة لتحسين مهارات التواصل.', price: 400, duration: 45 },
        { nameEn: 'Occupational Therapy', nameAr: 'العلاج الوظيفي', descriptionEn: 'Focused therapy for fine motor skills and daily living activities.', descriptionAr: 'علاج متخصص للمهارات الحركية الدقيقة وأنشطة الحياة اليومية.', price: 350, duration: 45 },
        { nameEn: 'ABA Therapy', nameAr: 'العلاج السلوكي التطبيقي', descriptionEn: 'Applied Behavior Analysis therapy for autism spectrum support.', descriptionAr: 'علاج تحليل السلوك التطبيقي لدعم طيف التوحد.', price: 450, duration: 60 },
      ],
    },
    {
      centerIdx: 1, // Bright Minds
      services: [
        { nameEn: 'Early Intervention', nameAr: 'التدخل المبكر', descriptionEn: 'Comprehensive early intervention program for children 0-5 years.', descriptionAr: 'برنامج تدخل مبكر شامل للأطفال من 0-5 سنوات.', price: 500, duration: 60 },
        { nameEn: 'Social Skills Group', nameAr: 'مجموعة المهارات الاجتماعية', descriptionEn: 'Group therapy sessions to develop social interaction skills.', descriptionAr: 'جلسات علاج جماعية لتطوير مهارات التفاعل الاجتماعي.', price: 300, duration: 90 },
        { nameEn: 'Parent Training', nameAr: 'تدريب الآباء', descriptionEn: 'Training sessions to help parents support their children at home.', descriptionAr: 'جلسات تدريبية لمساعدة الآباء على دعم أطفالهم في المنزل.', price: 350, duration: 60 },
      ],
    },
  ];

  const createdServices: Record<string, { id: string; centerId: string }[]> = {};

  for (const data of centerServicesData) {
    const centerProfile = centers[data.centerIdx].centerProfile;
    if (!centerProfile) continue;

    createdServices[centerProfile.id] = [];

    for (const serviceData of data.services) {
      const service = await prisma.centerService.create({
        data: {
          centerId: centerProfile.id,
          nameEn: serviceData.nameEn,
          nameAr: serviceData.nameAr,
          descriptionEn: serviceData.descriptionEn,
          descriptionAr: serviceData.descriptionAr,
          price: serviceData.price,
          duration: serviceData.duration,
          isActive: true,
        },
      });
      createdServices[centerProfile.id].push({ id: service.id, centerId: centerProfile.id });
    }
    console.log(`  ✓ Created ${data.services.length} services for ${centers[data.centerIdx].centerProfile?.nameEn}`);
  }

  // ============================================
  // 16. ASSIGN TEACHERS TO SERVICES
  // ============================================
  console.log('\nAssigning teachers to services...');

  // Hope Center - assign first 2 teachers to all services
  if (hopeCenterProfile && teachers[0].teacherProfile && teachers[1].teacherProfile) {
    const hopeServices = createdServices[hopeCenterProfile.id] || [];
    for (const service of hopeServices) {
      await prisma.teacherServiceAssignment.create({
        data: {
          serviceId: service.id,
          teacherId: teachers[0].teacherProfile.id,
          isActive: true,
        },
      });
      await prisma.teacherServiceAssignment.create({
        data: {
          serviceId: service.id,
          teacherId: teachers[1].teacherProfile.id,
          isActive: true,
        },
      });
    }
    console.log(`  ✓ Assigned 2 teachers to Hope Center services`);
  }

  // Bright Minds - assign teachers 2 and 3 to all services
  if (brightMindsProfile && teachers[2].teacherProfile && teachers[3].teacherProfile) {
    const brightMindsServices = createdServices[brightMindsProfile.id] || [];
    for (const service of brightMindsServices) {
      await prisma.teacherServiceAssignment.create({
        data: {
          serviceId: service.id,
          teacherId: teachers[2].teacherProfile.id,
          isActive: true,
        },
      });
      await prisma.teacherServiceAssignment.create({
        data: {
          serviceId: service.id,
          teacherId: teachers[3].teacherProfile.id,
          isActive: true,
        },
      });
    }
    console.log(`  ✓ Assigned 2 teachers to Bright Minds services`);
  }

  // ============================================
  // 17. CREATE CENTER SERVICE BOOKINGS
  // ============================================
  console.log('\nCreating center service bookings...');

  const centerBookingsData = [
    // Awaiting assignment bookings (need teacher to be assigned)
    { parentIdx: 0, centerIdx: 0, serviceIdx: 0, daysFromNow: 5, status: 'awaiting_assignment' as const, startTime: '10:00', endTime: '10:45' },
    { parentIdx: 1, centerIdx: 0, serviceIdx: 1, daysFromNow: 7, status: 'awaiting_assignment' as const, startTime: '14:00', endTime: '14:45' },
    { parentIdx: 2, centerIdx: 1, serviceIdx: 0, daysFromNow: 3, status: 'awaiting_assignment' as const, startTime: '11:00', endTime: '12:00' },
    // Confirmed center bookings (teacher already assigned)
    { parentIdx: 0, centerIdx: 0, serviceIdx: 2, daysFromNow: 10, status: 'confirmed' as const, startTime: '15:00', endTime: '16:00', teacherIdx: 0 },
    { parentIdx: 3, centerIdx: 1, serviceIdx: 1, daysFromNow: 14, status: 'confirmed' as const, startTime: '10:00', endTime: '11:30', teacherIdx: 2 },
  ];

  for (const bookingData of centerBookingsData) {
    const centerProfile = centers[bookingData.centerIdx].centerProfile;
    if (!centerProfile) continue;

    const services = createdServices[centerProfile.id];
    if (!services || !services[bookingData.serviceIdx]) continue;

    const service = await prisma.centerService.findUnique({
      where: { id: services[bookingData.serviceIdx].id },
    });
    if (!service) continue;

    const bookingDate = new Date(today);
    bookingDate.setDate(bookingDate.getDate() + bookingData.daysFromNow);

    const teacherId = bookingData.teacherIdx !== undefined && teachers[bookingData.teacherIdx]
      ? teachers[bookingData.teacherIdx].id
      : null;

    await prisma.booking.create({
      data: {
        parentId: parents[bookingData.parentIdx].id,
        centerId: centerProfile.id,
        serviceId: service.id,
        teacherId,
        status: bookingData.status,
        bookingDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        totalAmount: service.price,
        notes: bookingData.status === 'awaiting_assignment' ? 'Awaiting teacher assignment' : null,
      },
    });
  }
  console.log(`  ✓ Created ${centerBookingsData.length} center service bookings`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n========================================');
  console.log('Database seeding completed!');
  console.log('========================================');
  console.log('\nTest Accounts (all passwords: Test@123456):');
  console.log('\n  ADMIN:');
  console.log('    admin@liphant.co / Liphant@Admin2026!');
  console.log('\n  PARENTS:');
  parentsData.forEach(p => console.log(`    ${p.email}`));
  console.log('\n  TEACHERS:');
  teachersData.forEach(t => console.log(`    ${t.email} ${t.profile.isVerified ? '(verified)' : '(pending)'}`));
  console.log('\n  CENTER ADMINS:');
  centersData.forEach(c => console.log(`    ${c.email} - ${c.profile.nameEn} ${c.profile.isVerified ? '(verified)' : '(pending)'}`));
  console.log('\n========================================');
  console.log('Summary:');
  console.log(`  - ${parentsData.length} parents`);
  console.log(`  - ${teachersData.length} teachers`);
  console.log(`  - ${centersData.length} therapy centers`);
  console.log(`  - ${centerServicesData.reduce((acc, c) => acc + c.services.length, 0)} center services`);
  console.log(`  - ${bookingsData.length} direct bookings`);
  console.log(`  - ${centerBookingsData.length} center service bookings`);
  console.log(`  - ${sessionNotesData.length} session notes`);
  console.log(`  - ${sessionDocumentsData.length} session documents`);
  console.log(`  - ${reviewsData.length} reviews`);
  console.log(`  - ${conversationsData.length} conversations`);
  console.log(`  - ${forumCategories.length} forum categories`);
  console.log(`  - ${postsData.length} forum posts`);
  console.log(`  - ${eventsData.length} community events`);
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
