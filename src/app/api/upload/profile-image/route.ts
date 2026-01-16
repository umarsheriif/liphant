import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generatePresignedUploadUrl,
  generateProfileImageKey,
  isAllowedImageType,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  type ProfileImageType,
} from '@/lib/s3';
import { z } from 'zod';

const requestSchema = z.object({
  type: z.enum(['user', 'center', 'teacher']),
  targetId: z.string().min(1).optional(), // Optional - defaults to current user
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

    const { type, targetId, filename, contentType, fileSize } = validated.data;

    // 3. Validate file type
    if (!isAllowedImageType(contentType)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowed: Object.keys(ALLOWED_IMAGE_TYPES),
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          maxSize: MAX_IMAGE_SIZE,
          maxSizeMB: MAX_IMAGE_SIZE / (1024 * 1024),
        },
        { status: 400 }
      );
    }

    // 5. Determine the target ID and verify permissions
    let finalTargetId = targetId || session.user.id;

    if (type === 'user') {
      // Users can only update their own avatar (unless admin)
      if (finalTargetId !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'You can only update your own profile image' },
          { status: 403 }
        );
      }
    } else if (type === 'center') {
      // Verify user is admin of this center
      const center = await prisma.centerProfile.findUnique({
        where: { id: finalTargetId },
        select: { userId: true },
      });

      if (!center) {
        return NextResponse.json({ error: 'Center not found' }, { status: 404 });
      }

      if (center.userId !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'You do not have permission to update this center\'s image' },
          { status: 403 }
        );
      }
    } else if (type === 'teacher') {
      // Teachers can only update their own profile
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: finalTargetId },
        select: { userId: true },
      });

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      if (teacher.userId !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'You can only update your own profile image' },
          { status: 403 }
        );
      }
    }

    // 6. Generate S3 key
    const s3Key = generateProfileImageKey(type as ProfileImageType, finalTargetId, filename);

    // 7. Generate presigned URL
    const { uploadUrl, fileUrl } = await generatePresignedUploadUrl(s3Key, contentType);

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key: s3Key,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Error generating profile image presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
