'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { FileText, Lock, Pencil, Trash2 } from 'lucide-react';
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

interface SessionNotesListProps {
  notes: SessionNote[];
  currentUserId: string;
  onEdit?: (note: SessionNote) => void;
  onDelete?: (noteId: string) => Promise<void>;
  readOnly?: boolean;
}

export function SessionNotesList({
  notes,
  currentUserId,
  onEdit,
  onDelete,
  readOnly = false,
}: SessionNotesListProps) {
  const t = useTranslations('sessionRecords');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (noteId: string) => {
    if (!onDelete) return;
    setDeletingId(noteId);
    try {
      await onDelete(noteId);
    } finally {
      setDeletingId(null);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{t('noNotes')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-card border rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={note.author.avatarUrl || undefined} />
                <AvatarFallback>
                  {note.author.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{note.author.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(note.createdAt), 'PPp')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {note.isPrivate && (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <Lock className="h-3 w-3" />
                  {t('private')}
                </span>
              )}
              {!readOnly && note.author.id === currentUserId && (
                <>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(note)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === note.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('deleteNote')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('deleteNoteConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(note.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
        </div>
      ))}
    </div>
  );
}
