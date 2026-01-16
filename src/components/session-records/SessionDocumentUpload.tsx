'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Lock, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// File validation constants (must match server)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

interface SessionDocumentUploadProps {
  bookingId: string;
  onUpload: (data: {
    bookingId: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    isPrivate: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
}

interface UploadError {
  type: 'validation' | 'presign' | 'upload' | 'save';
  message: string;
}

export function SessionDocumentUpload({ bookingId, onUpload, onCancel }: SessionDocumentUploadProps) {
  const t = useTranslations('sessionRecords');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);

  const validateFile = useCallback(
    (file: File): UploadError | null => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
          type: 'validation',
          message: t('invalidFileType'),
        };
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          type: 'validation',
          message: t('fileTooLarge'),
        };
      }
      return null;
    },
    [t]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension for display name
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !name.trim()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get presigned URL from our API
      setUploadProgress(10);
      const presignResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          filename: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await presignResponse.json();
      setUploadProgress(20);

      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      setUploadProgress(80);

      // Step 3: Save document record via callback (server action)
      await onUpload({
        bookingId,
        name: name.trim(),
        fileUrl,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        isPrivate,
      });

      setUploadProgress(100);

      // Reset form on success
      setSelectedFile(null);
      setName('');
      setIsPrivate(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError({
        type: 'upload',
        message: err instanceof Error ? err.message : 'Upload failed',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-muted/50 p-4">
      {error && (
        <div className="flex items-center gap-2 rounded bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error.message}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('selectFile')}</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
            className="flex-1"
            disabled={isUploading}
          />
        </div>
        {selectedFile && (
          <p className="text-xs text-muted-foreground">
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('allowedTypes')}: PDF, JPG, PNG, GIF, Word, Excel. {t('maxSize')}: 10MB
        </p>
      </div>

      {selectedFile && (
        <>
          <div className="space-y-2">
            <Label htmlFor="docName">{t('documentName')}</Label>
            <Input
              id="docName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('documentNamePlaceholder')}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-center text-xs text-muted-foreground">
                {t('uploading')}... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="docPrivate"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={isUploading}
              />
              <Label htmlFor="docPrivate" className="flex items-center gap-1 text-sm">
                <Lock className="h-4 w-4" />
                {t('privateDocument')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
                  <X className="mr-1 h-4 w-4" />
                  {t('cancel')}
                </Button>
              )}
              <Button type="submit" disabled={!name.trim() || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    {t('uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="mr-1 h-4 w-4" />
                    {t('uploadDocument')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
