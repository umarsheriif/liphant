'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FileText, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SessionRecordCard } from '@/components/session-records';

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

interface BookingRecord {
  id: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  status: string;
  parent: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  teacher: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  sessionNotes: SessionNote[];
  sessionDocuments: SessionDocument[];
}

interface CenterRecordsClientProps {
  records: BookingRecord[];
  teachers: { id: string; fullName: string }[];
  currentUserId: string;
  currentFilters: {
    teacherId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

export function CenterRecordsClient({
  records,
  teachers,
  currentUserId,
  currentFilters,
}: CenterRecordsClientProps) {
  const t = useTranslations('sessionRecords');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentFilters.search || '');

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/center/records');
    setSearchInput('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', searchInput || null);
  };

  const hasFilters =
    currentFilters.teacherId || currentFilters.startDate || currentFilters.endDate || currentFilters.search;

  // Filter to only show bookings with records
  const recordsWithContent = records.filter(
    (r) => r.sessionNotes.length > 0 || r.sessionDocuments.length > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FileText className="h-6 w-6" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('centerDescription')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchNotes')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            {t('search')}
          </Button>
        </form>

        <Select
          value={currentFilters.teacherId || 'all'}
          onValueChange={(value) => updateFilters('teacherId', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('filterByTeacher')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTeachers')}</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            {t('clearFilters')}
          </Button>
        )}
      </div>

      {/* Records List */}
      {recordsWithContent.length > 0 ? (
        <div className="space-y-4">
          {recordsWithContent.map((record) => (
            <SessionRecordCard
              key={record.id}
              booking={record}
              currentUserId={currentUserId}
              showTeacher
              showParent
              readOnly // Center admins can only view, not edit
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{t('noRecordsFound')}</p>
          <p className="text-sm">{t('centerNoRecordsDescription')}</p>
        </div>
      )}
    </div>
  );
}
