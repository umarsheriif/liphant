import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generatePresignedUploadUrl,
  generateS3Key,
  isAllowedFileType,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from '@/lib/s3';
import { z } from 'zod';

const requestSchema = z.object({
  bookingId: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validated = requestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { bookingId, filename, contentType, fileSize } = validated.data;

    // 3. Validate file type
    if (!isAllowedFileType(contentType)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowed: Object.keys(ALLOWED_FILE_TYPES),
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          maxSize: MAX_FILE_SIZE,
          maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
        },
        { status: 400 }
      );
    }

    // 5. Fetch booking and verify user has access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        parentId: true,
        teacherId: true,
        teacher: {
          select: {
            id: true,
            teacherProfile: {
              select: {
                id: true,
                centerEmployments: {
                  where: { isActive: true },
                  select: {
                    centerId: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 6. Verify user is part of this booking
    const isParent = booking.parentId === session.user.id;
    const isTeacher = booking.teacherId === session.user.id;

    if (!isParent && !isTeacher) {
      return NextResponse.json(
        { error: 'You do not have permission to upload files to this booking' },
        { status: 403 }
      );
    }

    // 7. Determine center affiliation
    const centerId = booking.teacher?.teacherProfile?.centerEmployments?.[0]?.centerId || null;

    // 8. Generate S3 key with proper hierarchy
    const s3Key = generateS3Key({
      teacherId: booking.teacherId,
      parentId: booking.parentId,
      bookingId: booking.id,
      filename,
      centerId,
    });

    // 9. Generate presigned URL
    const { uploadUrl, fileUrl } = await generatePresignedUploadUrl(s3Key, contentType);

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key: s3Key,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
