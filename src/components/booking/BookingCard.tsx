'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { cancelBooking } from '@/app/[locale]/(dashboard)/parent/bookings/actions';
import { confirmBooking, declineBooking, completeBooking } from '@/app/[locale]/(dashboard)/teacher/bookings/actions';
import { toast } from 'sonner';
import type { Booking, User, TeacherProfile } from '@prisma/client';

type BookingWithDetails = Booking & {
  teacher: (User & { teacherProfile: TeacherProfile | null }) | null;
  parent: User;
};

interface BookingCardProps {
  booking: BookingWithDetails;
  viewAs: 'parent' | 'teacher';
}

export function BookingCard({ booking, viewAs }: BookingCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // For center bookings without teacher assigned yet, show a placeholder
  const otherParty = viewAs === 'parent'
    ? booking.teacher || { fullName: 'Teacher to be assigned', avatarUrl: null, teacherProfile: null }
    : booking.parent;
  const initials = otherParty.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleCancel = async () => {
    setIsLoading('cancel');
    const result = await cancelBooking(booking.id);
    setIsLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Booking cancelled');
    }
  };

  const handleConfirm = async () => {
    setIsLoading('confirm');
    const result = await confirmBooking(booking.id);
    setIsLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Booking confirmed');
    }
  };

  const handleDecline = async () => {
    setIsLoading('decline');
    const result = await declineBooking(booking.id);
    setIsLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Booking declined');
    }
  };

  const handleComplete = async () => {
    setIsLoading('complete');
    const result = await completeBooking(booking.id);
    setIsLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Booking marked as complete');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherParty.avatarUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{otherParty.fullName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(booking.bookingDate), 'PPP')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              {viewAs === 'parent' && booking.teacher?.teacherProfile?.city && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {booking.teacher.teacherProfile.city}, {booking.teacher.teacherProfile.district}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <BookingStatusBadge status={booking.status} />
            <span className="text-lg font-semibold text-primary">
              {booking.totalAmount} EGP
            </span>
          </div>
        </div>

        {booking.notes && (
          <p className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            {booking.notes}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link href={`/bookings/${booking.id}`}>View Details</Link>
          </Button>

          {viewAs === 'teacher' && booking.status === 'pending' && (
            <>
              <Button
                onClick={handleConfirm}
                disabled={isLoading !== null}
                className="flex-1"
              >
                {isLoading === 'confirm' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirm'
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={isLoading !== null}
                className="flex-1"
              >
                {isLoading === 'decline' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Decline'
                )}
              </Button>
            </>
          )}

          {viewAs === 'teacher' && booking.status === 'confirmed' && (
            <Button
              onClick={handleComplete}
              disabled={isLoading !== null}
              className="flex-1"
            >
              {isLoading === 'complete' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Complete'
              )}
            </Button>
          )}

          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading !== null}
              className="flex-1 text-destructive hover:text-destructive"
            >
              {isLoading === 'cancel' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Cancel'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
