'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Loader2, UserCheck, UserMinus } from 'lucide-react';
import { assignTeacherToService, removeTeacherFromService } from '@/app/[locale]/(dashboard)/center/services/actions';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  isAssigned: boolean;
  availabilityCount: number;
}

interface TeacherAssignmentManagerProps {
  serviceId: string;
  teachers: Teacher[];
}

export function TeacherAssignmentManager({ serviceId, teachers }: TeacherAssignmentManagerProps) {
  const [loadingTeacherId, setLoadingTeacherId] = useState<string | null>(null);
  const [localTeachers, setLocalTeachers] = useState(teachers);

  const handleToggleAssignment = async (teacher: Teacher) => {
    setLoadingTeacherId(teacher.id);

    try {
      if (teacher.isAssigned) {
        const result = await removeTeacherFromService(serviceId, teacher.id);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`${teacher.user.fullName} removed from service`);
          setLocalTeachers((prev) =>
            prev.map((t) => (t.id === teacher.id ? { ...t, isAssigned: false } : t))
          );
        }
      } else {
        const result = await assignTeacherToService(serviceId, teacher.id);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`${teacher.user.fullName} assigned to service`);
          setLocalTeachers((prev) =>
            prev.map((t) => (t.id === teacher.id ? { ...t, isAssigned: true } : t))
          );
        }
      }
    } finally {
      setLoadingTeacherId(null);
    }
  };

  if (teachers.length === 0) {
    return (
      <div className="py-8 text-center">
        <UserMinus className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No teachers available</h3>
        <p className="text-muted-foreground">
          Add teachers to your center first before assigning them to services.
        </p>
      </div>
    );
  }

  const assignedCount = localTeachers.filter((t) => t.isAssigned).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {assignedCount} of {localTeachers.length} teacher(s) assigned
        </p>
      </div>

      <div className="grid gap-3">
        {localTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className={teacher.isAssigned ? 'border-primary/50 bg-primary/5' : ''}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <Checkbox
                checked={teacher.isAssigned}
                disabled={loadingTeacherId === teacher.id}
                onCheckedChange={() => handleToggleAssignment(teacher)}
                className="h-5 w-5"
              />
              <Avatar className="h-10 w-10">
                <AvatarImage src={teacher.user.avatarUrl || undefined} />
                <AvatarFallback>
                  {teacher.user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{teacher.user.fullName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{teacher.availabilityCount} availability slot(s)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {teacher.isAssigned && (
                  <Badge variant="secondary" className="gap-1">
                    <UserCheck className="h-3 w-3" />
                    Assigned
                  </Badge>
                )}
                {loadingTeacherId === teacher.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
