'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  File,
  FileImage,
  FileText,
  Download,
  Lock,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SessionDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  isPrivate: boolean;
  createdAt: Date;
  uploadedBy: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  };
}

interface SessionDocumentsListProps {
  documents: SessionDocument[];
  currentUserId: string;
  onDelete?: (documentId: string) => Promise<void>;
  readOnly?: boolean;
}

function getFileIcon(fileType: string) {
  if (fileType.includes('image')) {
    return FileImage;
  }
  if (fileType.includes('pdf')) {
    return FileText;
  }
  if (fileType.includes('sheet') || fileType.includes('excel')) {
    return FileSpreadsheet;
  }
  return File;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SessionDocumentsList({
  documents,
  currentUserId,
  onDelete,
  readOnly = false,
}: SessionDocumentsListProps) {
  const t = useTranslations('sessionRecords');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!onDelete) return;
    setDeletingId(documentId);
    try {
      await onDelete(documentId);
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{t('noDocuments')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const FileIcon = getFileIcon(doc.fileType);
        return (
          <div
            key={doc.id}
            className="flex items-center gap-4 bg-card border rounded-lg p-4"
          >
            <div className="flex-shrink-0 p-2 bg-muted rounded">
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{doc.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={doc.uploadedBy.avatarUrl || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {doc.uploadedBy.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{doc.uploadedBy.fullName}</span>
                </div>
                <span>•</span>
                <span>{format(new Date(doc.createdAt), 'PP')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.isPrivate && (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <Lock className="h-3 w-3" />
                </span>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  {t('downloadDocument')}
                </a>
              </Button>
              {!readOnly && doc.uploadedBy.id === currentUserId && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === doc.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteDocument')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteDocumentConfirm')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(doc.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
