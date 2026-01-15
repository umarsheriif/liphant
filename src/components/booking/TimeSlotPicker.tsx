'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelect: (startTime: string, endTime: string) => void;
}

export function TimeSlotPicker({ slots, selectedSlot, onSelect }: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No available slots for this day
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => (
        <Button
          key={slot.startTime}
          type="button"
          variant={selectedSlot === slot.startTime ? 'default' : 'outline'}
          className={cn(
            'h-auto py-3',
            slot.isBooked && 'cursor-not-allowed opacity-50'
          )}
          disabled={slot.isBooked}
          onClick={() => onSelect(slot.startTime, slot.endTime)}
        >
          <div className="text-center">
            <div className="font-medium">
              {slot.startTime} - {slot.endTime}
            </div>
            {slot.isBooked && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Booked
              </Badge>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}
