import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Client singleton - disable request checksums for browser compatibility
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME!;

// Allowed MIME types with their extensions
export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function isAllowedFileType(mimeType: string): boolean {
  return mimeType in ALLOWED_FILE_TYPES;
}

export function getFileExtension(mimeType: string): string {
  const extensions = ALLOWED_FILE_TYPES[mimeType];
  return extensions?.[0] || '';
}

// Generate the S3 key based on teacher affiliation
export interface S3KeyParams {
  teacherId: string;
  parentId: string;
  bookingId: string;
  filename: string;
  centerId?: string | null;
}

export function generateS3Key(params: S3KeyParams): string {
  const { teacherId, parentId, bookingId, filename, centerId } = params;

  // Sanitize filename - remove special characters, keep extension
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();

  // Add timestamp to prevent collisions
  const timestamp = Date.now();
  const finalFilename = `${timestamp}-${sanitizedFilename}`;

  if (centerId) {
    // Center-affiliated teacher
    return `centers/${centerId}/teachers/${teacherId}/parents/${parentId}/bookings/${bookingId}/${finalFilename}`;
  } else {
    // Independent teacher
    return `independent/teachers/${teacherId}/parents/${parentId}/bookings/${bookingId}/${finalFilename}`;
  }
}

// Generate presigned URL for upload
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 300 // 5 minutes
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  // The final URL where the file will be accessible
  const fileUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
}

// Delete a file from S3
export async function deleteS3Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

// Extract S3 key from file URL
export function extractS3KeyFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    // Handle virtual-hosted-style URLs: bucket.s3.region.amazonaws.com/key
    if (url.hostname.includes('.s3.')) {
      return url.pathname.slice(1); // Remove leading slash
    }
    // Handle path-style URLs: s3.region.amazonaws.com/bucket/key
    if (url.hostname.startsWith('s3.')) {
      const parts = url.pathname.split('/');
      return parts.slice(2).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

// Verify file exists in S3
export async function verifyS3Object(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

// Profile image types
export type ProfileImageType = 'user' | 'center' | 'teacher';

// Generate S3 key for profile images
export function generateProfileImageKey(
  type: ProfileImageType,
  id: string,
  filename: string
): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  return `staticsbyliph/${type}s/${id}/avatar-${timestamp}.${ext}`;
}

// Allowed image types for profile pictures
export const ALLOWED_IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export function isAllowedImageType(mimeType: string): boolean {
  return mimeType in ALLOWED_IMAGE_TYPES;
}
