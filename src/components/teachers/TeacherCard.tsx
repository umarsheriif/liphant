'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import type { Specialization } from '@prisma/client';

export interface TeacherCardData {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bioEn: string | null;
  bioAr: string | null;
  specializations: Specialization[];
  experienceYears: number;
  hourlyRate: number;
  city: string | null;
  district: string | null;
  isVerified: boolean;
  ratingAvg: number;
  reviewCount: number;
}

interface TeacherCardProps {
  teacher: TeacherCardData;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const locale = useLocale();
  const t = useTranslations('teacher.card');
  const tSpec = useTranslations('specializations');

  const bio = locale === 'ar' ? teacher.bioAr : teacher.bioEn;
  const initials = teacher.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Avatar Section */}
          <div className="relative flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-6 sm:w-48">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage
                src={teacher.avatarUrl || undefined}
                alt={teacher.fullName}
              />
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {teacher.isVerified && (
              <div className="absolute bottom-4 right-4 rounded-full bg-accent p-1">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{teacher.fullName}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  {teacher.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {teacher.city}
                      {teacher.district && `, ${teacher.district}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {t('experience', { years: teacher.experienceYears })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="font-semibold">
                    {teacher.ratingAvg > 0 ? teacher.ratingAvg.toFixed(1) : 'New'}
                  </span>
                  {teacher.reviewCount > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({teacher.reviewCount})
                    </span>
                  )}
                </div>
                <div className="mt-1 text-lg font-bold text-primary">
                  {teacher.hourlyRate} EGP
                  <span className="text-sm font-normal text-muted-foreground">
                    {t('perHour')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {bio && (
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {bio}
              </p>
            )}

            {/* Specializations */}
            <div className="mb-4 flex flex-wrap gap-2">
              {teacher.specializations.slice(0, 4).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {tSpec(spec)}
                </Badge>
              ))}
              {teacher.specializations.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{teacher.specializations.length - 4}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/teachers/${teacher.id}`}>{t('viewProfile')}</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href={`/teachers/${teacher.id}/book`}>{t('bookNow')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
