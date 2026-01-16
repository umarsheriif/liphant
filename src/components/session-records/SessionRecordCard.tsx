'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, Clock, FileText, File, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SessionNotesList } from './SessionNotesList';
import { SessionDocumentsList } from './SessionDocumentsList';

interface SessionNote {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  };
}

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

interface SessionRecordCardProps {
  booking: {
    id: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    status: string;
    parent?: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
    };
    teacher?: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
    };
    sessionNotes: SessionNote[];
    sessionDocuments: SessionDocument[];
  };
  currentUserId: string;
  showTeacher?: boolean;
  showParent?: boolean;
  onDeleteNote?: (noteId: string) => Promise<void>;
  onDeleteDocument?: (documentId: string) => Promise<void>;
  readOnly?: boolean;
}

export function SessionRecordCard({
  booking,
  currentUserId,
  showTeacher = false,
  showParent = false,
  onDeleteNote,
  onDeleteDocument,
  readOnly = false,
}: SessionRecordCardProps) {
  const t = useTranslations('sessionRecords');
  const [isExpanded, setIsExpanded] = useState(false);

  const notesCount = booking.sessionNotes.length;
  const documentsCount = booking.sessionDocuments.length;
  const totalRecords = notesCount + documentsCount;

  const personToShow = showTeacher ? booking.teacher : showParent ? booking.parent : null;

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(booking.bookingDate), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{booking.startTime} - {booking.endTime}</span>
              </div>
            </div>
            {personToShow && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={personToShow.avatarUrl || undefined} />
                  <AvatarFallback>
                    {personToShow.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{personToShow.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {showTeacher ? t('teacher') : t('parent')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {notesCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {notesCount}
                </Badge>
              )}
              {documentsCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <File className="h-3 w-3" />
                  {documentsCount}
                </Badge>
              )}
              {totalRecords === 0 && (
                <span className="text-sm text-muted-foreground">{t('noRecords')}</span>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && totalRecords > 0 && (
        <div className="border-t p-4 space-y-6">
          {notesCount > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('notes')} ({notesCount})
              </h4>
              <SessionNotesList
                notes={booking.sessionNotes}
                currentUserId={currentUserId}
                onDelete={onDeleteNote}
                readOnly={readOnly}
              />
            </div>
          )}
          {documentsCount > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <File className="h-4 w-4" />
                {t('documents')} ({documentsCount})
              </h4>
              <SessionDocumentsList
                documents={booking.sessionDocuments}
                currentUserId={currentUserId}
                onDelete={onDeleteDocument}
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
