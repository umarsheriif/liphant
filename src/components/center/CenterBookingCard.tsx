'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, User, Briefcase, Loader2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { assignTeacherToBooking, updateBookingStatus } from '@/app/[locale]/(dashboard)/center/bookings/actions';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  availabilityCount: number;
}

interface Booking {
  id: string;
  status: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
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
  } | null;
  service: {
    id: string;
    nameEn: string;
    price: number;
    duration: number;
  } | null;
}

interface CenterBookingCardProps {
  booking: Booking;
  teachers: Teacher[];
  showAssignment?: boolean;
}

const statusConfig = {
  awaiting_assignment: {
    label: 'Awaiting Assignment',
    variant: 'outline' as const,
    className: 'border-amber-500 text-amber-600',
  },
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    className: '',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'default' as const,
    className: '',
  },
  completed: {
    label: 'Completed',
    variant: 'outline' as const,
    className: 'border-green-500 text-green-600',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    className: '',
  },
};

export function CenterBookingCard({ booking, teachers, showAssignment = false }: CenterBookingCardProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  const status = statusConfig[booking.status as keyof typeof statusConfig] || {
    label: booking.status,
    variant: 'secondary' as const,
    className: '',
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher');
      return;
    }

    setIsAssigning(true);
    const result = await assignTeacherToBooking(booking.id, selectedTeacher);
    setIsAssigning(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Teacher assigned successfully');
      setSelectedTeacher('');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const result = await updateBookingStatus(
      booking.id,
      newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled'
    );

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Booking marked as ${newStatus}`);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          {/* Parent info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={booking.parent.avatarUrl || undefined} />
              <AvatarFallback>
                {booking.parent.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">{booking.parent.fullName}</span>
              {booking.teacher && (
                <span className="text-muted-foreground">
                  {' '}
                  with <span className="font-medium">{booking.teacher.fullName}</span>
                </span>
              )}
            </div>
          </div>

          {/* Service info */}
          {booking.service && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.service.nameEn}</span>
              <span className="text-muted-foreground">
                ({booking.service.duration} min)
              </span>
            </div>
          )}

          {/* Date and time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {booking.startTime} - {booking.endTime}
            </span>
          </div>

          {/* Notes */}
          {booking.notes && (
            <p className="text-sm text-muted-foreground">{booking.notes}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className={status.className}>
              {status.label}
            </Badge>
            <span className="font-semibold text-primary">{booking.totalAmount} SAR</span>
          </div>

          {/* Status change dropdown for assigned bookings */}
          {booking.status !== 'awaiting_assignment' && booking.status !== 'cancelled' && (
            <Select
              value={booking.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Teacher assignment section */}
      {showAssignment && booking.status === 'awaiting_assignment' && (
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.userId} value={teacher.userId}>
                  <div className="flex items-center gap-2">
                    <span>{teacher.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({teacher.availabilityCount} slots)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAssignTeacher}
            disabled={!selectedTeacher || isAssigning}
          >
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </div>
      )}
    </div>
  );
}
