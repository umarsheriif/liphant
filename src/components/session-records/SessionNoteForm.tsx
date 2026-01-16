'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SessionNoteFormProps {
  bookingId: string;
  initialContent?: string;
  initialIsPrivate?: boolean;
  noteId?: string;
  onSubmit: (data: {
    bookingId: string;
    content: string;
    isPrivate: boolean;
    noteId?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function SessionNoteForm({
  bookingId,
  initialContent = '',
  initialIsPrivate = false,
  noteId,
  onSubmit,
  onCancel,
  isEditing = false,
}: SessionNoteFormProps) {
  const t = useTranslations('sessionRecords');
  const [content, setContent] = useState(initialContent);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        bookingId,
        content: content.trim(),
        isPrivate,
        noteId,
      });
      if (!isEditing) {
        setContent('');
        setIsPrivate(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('notePlaceholder')}
          rows={4}
          className="resize-none"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="isPrivate"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
          <Label htmlFor="isPrivate" className="flex items-center gap-1 text-sm">
            <Lock className="h-4 w-4" />
            {t('privateNote')}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              {t('cancel')}
            </Button>
          )}
          <Button type="submit" disabled={!content.trim() || isSubmitting}>
            <Save className="h-4 w-4 mr-1" />
            {isEditing ? t('saveNote') : t('addNote')}
          </Button>
        </div>
      </div>
    </form>
  );
}
