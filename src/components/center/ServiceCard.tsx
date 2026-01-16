'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, DollarSign, MoreVertical, Users, Eye, Edit, Trash, Power } from 'lucide-react';
import { toggleServiceStatus, deleteService } from '@/app/[locale]/(dashboard)/center/services/actions';
import { toast } from 'sonner';

interface ServiceCardProps {
  service: {
    id: string;
    nameEn: string;
    nameAr: string | null;
    descriptionEn: string | null;
    price: number;
    duration: number;
    isActive: boolean;
    teacherAssignments: {
      teacher: {
        user: {
          id: string;
          fullName: string;
          avatarUrl: string | null;
        };
      };
    }[];
    _count: {
      bookings: number;
    };
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    setIsLoading(true);
    const result = await toggleServiceStatus(service.id);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(service.isActive ? 'Service deactivated' : 'Service activated');
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteService(service.id);
    setIsLoading(false);
    setIsDeleteDialogOpen(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Service deleted successfully');
    }
  };

  return (
    <>
      <Card className={!service.isActive ? 'opacity-60' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{service.nameEn}</CardTitle>
              {service.nameAr && (
                <p className="text-sm text-muted-foreground" dir="rtl">
                  {service.nameAr}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={service.isActive ? 'default' : 'secondary'}>
                {service.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/center/services/${service.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/center/services/${service.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
                    <Power className="mr-2 h-4 w-4" />
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                    disabled={isLoading}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {service.descriptionEn && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.descriptionEn}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              {service.price} SAR
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              {service.duration} min
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {service.teacherAssignments.length} teacher(s) assigned
            </span>
          </div>

          {service.teacherAssignments.length > 0 && (
            <div className="flex -space-x-2">
              {service.teacherAssignments.slice(0, 4).map((assignment) => (
                <Avatar key={assignment.teacher.user.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={assignment.teacher.user.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {assignment.teacher.user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {service.teacherAssignments.length > 4 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{service.teacherAssignments.length - 4}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
            <span>{service._count.bookings} booking(s)</span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/center/services/${service.id}`}>
                Manage
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{service.nameEn}&quot;? This action cannot be undone.
              {service._count.bookings > 0 && (
                <span className="mt-2 block text-amber-600">
                  Note: This service has {service._count.bookings} booking(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
