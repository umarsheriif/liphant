'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  File,
  Plus,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import {
  SessionNotesList,
  SessionNoteForm,
  SessionDocumentsList,
  SessionDocumentUpload,
} from '@/components/session-records';
import {
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
  createSessionDocument,
  deleteSessionDocument,
} from './actions';
import { toast } from 'sonner';

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

interface BookingDetailClientProps {
  booking: {
    id: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    status: string;
    totalAmount: number;
    notes: string | null;
    parent: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
    };
    teacher: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
      teacherProfile?: {
        specializations: string[];
      } | null;
    } | null;
    sessionNotes: SessionNote[];
    sessionDocuments: SessionDocument[];
  };
  currentUserId: string;
  viewAs: 'parent' | 'teacher';
}

export function BookingDetailClient({
  booking,
  currentUserId,
  viewAs,
}: BookingDetailClientProps) {
  const t = useTranslations('sessionRecords');
  const tBooking = useTranslations('booking');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);

  // For center bookings without teacher assigned yet, show a placeholder
  const otherParty = viewAs === 'parent'
    ? booking.teacher || { id: '', fullName: 'Teacher to be assigned', avatarUrl: null }
    : booking.parent;
  const backUrl = viewAs === 'parent' ? '/parent/bookings' : '/teacher/bookings';

  const canAddRecords = booking.status === 'confirmed' || booking.status === 'completed';

  const handleCreateNote = async (data: {
    bookingId: string;
    content: string;
    isPrivate: boolean;
  }) => {
    const result = await createSessionNote(data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('noteAdded'));
      setShowNoteForm(false);
    }
  };

  const handleUpdateNote = async (data: {
    bookingId: string;
    content: string;
    isPrivate: boolean;
    noteId?: string;
  }) => {
    if (!data.noteId) return;
    const result = await updateSessionNote({
      noteId: data.noteId,
      content: data.content,
      isPrivate: data.isPrivate,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('noteUpdated'));
      setEditingNote(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const result = await deleteSessionNote(noteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('noteDeleted'));
    }
  };

  const handleUploadDocument = async (data: {
    bookingId: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    isPrivate: boolean;
  }) => {
    const result = await createSessionDocument(data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('documentUploaded'));
      setShowDocUpload(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    const result = await deleteSessionDocument(documentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t('documentDeleted'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tBooking('backToBookings')}
          </Link>
        </Button>
      </div>

      {/* Booking Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={otherParty.avatarUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {otherParty.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{otherParty.fullName}</h2>
                <p className="text-sm text-muted-foreground">
                  {viewAs === 'parent' ? tBooking('teacher') : tBooking('parent')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <BookingStatusBadge status={booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'} />
              <p className="mt-2 text-2xl font-bold text-primary">
                {booking.totalAmount} EGP
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>{format(new Date(booking.bookingDate), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Notes & Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes">
            <TabsList className="mb-4">
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('notes')} ({booking.sessionNotes.length})
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                {t('documents')} ({booking.sessionDocuments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-4">
              {canAddRecords && !showNoteForm && !editingNote && (
                <Button onClick={() => setShowNoteForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addNote')}
                </Button>
              )}

              {showNoteForm && (
                <div className="border rounded-lg p-4">
                  <SessionNoteForm
                    bookingId={booking.id}
                    onSubmit={handleCreateNote}
                    onCancel={() => setShowNoteForm(false)}
                  />
                </div>
              )}

              {editingNote && (
                <div className="border rounded-lg p-4">
                  <SessionNoteForm
                    bookingId={booking.id}
                    noteId={editingNote.id}
                    initialContent={editingNote.content}
                    initialIsPrivate={editingNote.isPrivate}
                    onSubmit={handleUpdateNote}
                    onCancel={() => setEditingNote(null)}
                    isEditing
                  />
                </div>
              )}

              <SessionNotesList
                notes={booking.sessionNotes}
                currentUserId={currentUserId}
                onEdit={canAddRecords ? setEditingNote : undefined}
                onDelete={canAddRecords ? handleDeleteNote : undefined}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {canAddRecords && !showDocUpload && (
                <Button onClick={() => setShowDocUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('uploadDocument')}
                </Button>
              )}

              {showDocUpload && (
                <SessionDocumentUpload
                  bookingId={booking.id}
                  onUpload={handleUploadDocument}
                  onCancel={() => setShowDocUpload(false)}
                />
              )}

              <SessionDocumentsList
                documents={booking.sessionDocuments}
                currentUserId={currentUserId}
                onDelete={canAddRecords ? handleDeleteDocument : undefined}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
