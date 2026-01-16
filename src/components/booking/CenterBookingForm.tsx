'use client';

import { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, DollarSign, Loader2, CheckCircle } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  createCenterBooking,
  getAvailability,
  type CenterBookingActionState,
} from '@/app/[locale]/(public)/centers/[id]/book/actions';
import { toast } from 'sonner';

interface Service {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  price: number;
  duration: number;
  teacherAssignments: {
    teacherId: string;
  }[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  availableCount: number;
  isAvailable: boolean;
}

interface CenterBookingFormProps {
  centerId: string;
  services: Service[];
  selectedServiceId?: string;
}

const initialState: CenterBookingActionState = {};

export function CenterBookingForm({
  centerId,
  services,
  selectedServiceId,
}: CenterBookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>(selectedServiceId || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [state, formAction, isPending] = useActionState(createCenterBooking, initialState);

  const service = services.find((s) => s.id === selectedService);

  // Load availability when date changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      getAvailability(selectedService, format(selectedDate, 'yyyy-MM-dd'))
        .then((data) => {
          setSlots(data);
        })
        .catch(() => {
          setSlots([]);
          toast.error('Failed to load availability');
        })
        .finally(() => {
          setIsLoadingSlots(false);
        });
    }
  }, [selectedService, selectedDate]);

  useEffect(() => {
    if (state.success) {
      toast.success('Booking request submitted! The center will assign a teacher soon.');
      router.push('/parent/bookings');
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) {
      setStep(3);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  const availableSlots = slots.filter((s) => s.isAvailable);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                step >= i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step > i ? <CheckCircle className="h-4 w-4" /> : i}
            </div>
            {i < 4 && (
              <div
                className={cn(
                  'h-1 w-12 sm:w-20',
                  step > i ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      <div className={cn(step !== 1 && 'hidden')}>
        <h3 className="mb-4 text-lg font-medium">Select a Service</h3>
        <RadioGroup value={selectedService} onValueChange={handleServiceSelect}>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s.id}
                className={cn(
                  'cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50',
                  selectedService === s.id && 'border-primary bg-primary/5'
                )}
              >
                <RadioGroupItem value={s.id} className="sr-only" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{s.nameEn}</p>
                    {s.descriptionEn && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {s.descriptionEn}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <DollarSign className="h-3 w-3" />
                    {s.price} SAR
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {s.duration} min
                  </span>
                </div>
                {s.teacherAssignments.length === 0 && (
                  <Badge variant="secondary" className="mt-2">
                    No teachers assigned
                  </Badge>
                )}
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Step 2: Select Date */}
      <div className={cn(step !== 2 && 'hidden')}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Select a Date</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            Change Service
          </Button>
        </div>
        {service && (
          <Card className="mb-4">
            <CardContent className="flex items-center justify-between p-3">
              <span className="font-medium">{service.nameEn}</span>
              <span className="text-sm text-muted-foreground">
                {service.price} SAR - {service.duration} min
              </span>
            </CardContent>
          </Card>
        )}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) =>
              isBefore(date, startOfDay(new Date())) ||
              isBefore(addDays(new Date(), 60), date)
            }
            className="rounded-md border"
          />
        </div>
      </div>

      {/* Step 3: Select Time */}
      <div className={cn(step !== 3 && 'hidden')}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Select a Time</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
            Change Date
          </Button>
        </div>
        {service && selectedDate && (
          <Card className="mb-4">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <span className="font-medium">{service.nameEn}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        {isLoadingSlots ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No available time slots for this date. Please select another date.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setStep(2)}>
              Choose Another Date
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
            {availableSlots.map((slot) => (
              <Button
                key={`${slot.startTime}-${slot.endTime}`}
                variant={selectedSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                onClick={() => handleSlotSelect(slot)}
                className="justify-start"
              >
                <Clock className="mr-2 h-4 w-4" />
                {slot.startTime} - {slot.endTime}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Step 4: Confirm */}
      <div className={cn(step !== 4 && 'hidden')}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Confirm Booking</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
            Change Time
          </Button>
        </div>

        {service && selectedDate && selectedSlot && (
          <form action={formAction}>
            <input type="hidden" name="serviceId" value={service.id} />
            <input type="hidden" name="bookingDate" value={format(selectedDate, 'yyyy-MM-dd')} />
            <input type="hidden" name="startTime" value={selectedSlot.startTime} />
            <input type="hidden" name="endTime" value={selectedSlot.endTime} />

            <Card className="mb-4">
              <CardContent className="space-y-3 p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{service.nameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{service.duration} minutes</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">{service.price} SAR</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mb-4 space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements or notes for the session..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
