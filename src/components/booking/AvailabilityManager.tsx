'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { addAvailability, removeAvailability } from '@/app/[locale]/(dashboard)/teacher/availability/actions';
import { toast } from 'sonner';
import type { Availability } from '@prisma/client';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface AvailabilityManagerProps {
  availabilities: Availability[];
}

export function AvailabilityManager({ availabilities }: AvailabilityManagerProps) {
  const [state, formAction, isPending] = useActionState(addAvailability, {});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupedByDay = availabilities.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, Availability[]>);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await removeAvailability(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Availability removed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Slot Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Availability Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day</Label>
              <Select name="dayOfWeek" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input type="time" name="startTime" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input type="time" name="endTime" required />
            </div>
            <div className="flex items-end">
              <input type="hidden" name="isRecurring" value="true" />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Slot'
                )}
              </Button>
            </div>
          </form>
          {state.error && (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Your Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day.value}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <span className="w-24 font-medium">{day.label}</span>
                <div className="flex flex-1 flex-wrap gap-2 justify-end">
                  {groupedByDay[day.value]?.length ? (
                    groupedByDay[day.value].map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-1 rounded-md border bg-secondary/50 px-3 py-1.5"
                      >
                        <span className="text-sm font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-6 w-6 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                        >
                          {deletingId === slot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Not available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
