'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import { Loader2, CalendarDays, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface BookingFormProps {
  teacherId: string;
  teacherUserId: string;
  teacherName: string;
  hourlyRate: number;
  createBookingAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  getAvailabilityAction: (date: string) => Promise<TimeSlot[]>;
}

export function BookingForm({
  teacherId,
  teacherUserId,
  teacherName,
  hourlyRate,
  createBookingAction,
  getAvailabilityAction,
}: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch availability when date changes
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      getAvailabilityAction(dateStr)
        .then((slots) => setAvailableSlots(slots))
        .catch(() => toast.error('Failed to load availability'))
        .finally(() => setLoadingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, getAvailabilityAction]);

  const handleSlotSelect = (startTime: string, endTime: string) => {
    setSelectedSlot({ start: startTime, end: endTime });
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('teacherId', teacherUserId);
    formData.append('bookingDate', format(selectedDate, 'yyyy-MM-dd'));
    formData.append('startTime', selectedSlot.start);
    formData.append('endTime', selectedSlot.end);
    formData.append('notes', notes);

    const result = await createBookingAction(formData);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Booking request sent!');
      router.push('/parent/bookings');
    }
  };

  // Disable past dates and dates more than 30 days in the future
  const disabledDays = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 30),
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots & Booking Details */}
      <div className="space-y-6">
        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="py-8 text-center text-muted-foreground">
                Please select a date first
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <TimeSlotPicker
                slots={availableSlots}
                selectedSlot={selectedSlot?.start || null}
                onSelect={handleSlotSelect}
              />
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="notes" className="sr-only">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements or information for the teacher..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Summary & Submit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teacher</span>
                <span className="font-medium">{teacherName}</span>
              </div>
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
              )}
              {selectedSlot && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {selectedSlot.start} - {selectedSlot.end}
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{hourlyRate} EGP</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedSlot || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                'Request Booking'
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              The teacher will confirm your booking request
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
