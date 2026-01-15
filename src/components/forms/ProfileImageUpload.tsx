'use client';

import { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileImageUploadProps {
  currentImage: string | null;
  fallbackText: string;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

const buttonSizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ProfileImageUpload({
  currentImage,
  fallbackText,
  onImageChange,
  size = 'md',
  disabled = false,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = previewUrl || currentImage;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, GIF, or WebP image';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be less than 2MB';
    }
    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageChange(file, result);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div
        className={`relative ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''} rounded-full transition-all`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Avatar
          className={`${sizeClasses[size]} cursor-pointer transition-opacity hover:opacity-90`}
          onClick={openFileDialog}
        >
          <AvatarImage src={displayImage || undefined} />
          <AvatarFallback className={size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg'}>
            {fallbackText}
          </AvatarFallback>
        </Avatar>

        {/* Camera button overlay */}
        <Button
          size="icon"
          variant="secondary"
          className={`absolute -bottom-1 -right-1 ${buttonSizeClasses[size]} rounded-full shadow-md`}
          onClick={openFileDialog}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>

        {/* Remove button - shows when there's a preview */}
        {previewUrl && (
          <Button
            size="icon"
            variant="destructive"
            className={`absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-md`}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={disabled || isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF or WebP. Max 2MB.
        </p>
        {previewUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={disabled}
          >
            Remove photo
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
