import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getCenterServiceById } from '@/lib/data/center-services';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Edit, Users } from 'lucide-react';
import { TeacherAssignmentManager } from '@/components/center/TeacherAssignmentManager';

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'center_admin') {
    redirect('/login');
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      centerTeachers: {
        where: { isActive: true },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              availabilities: true,
            },
          },
        },
      },
    },
  });

  if (!centerProfile) {
    redirect('/center/profile');
  }

  const service = await getCenterServiceById(id);

  if (!service || service.centerId !== centerProfile.id) {
    notFound();
  }

  // Get assigned teacher IDs
  const assignedTeacherIds = new Set(
    service.teacherAssignments.map((a) => a.teacher.id)
  );

  // Get all center teachers with their assignment status
  const teachersWithStatus = centerProfile.centerTeachers.map((ct) => ({
    ...ct.teacher,
    isAssigned: assignedTeacherIds.has(ct.teacher.id),
    availabilityCount: ct.teacher.availabilities.length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/center/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{service.nameEn}</h1>
            <Badge variant={service.isActive ? 'default' : 'secondary'}>
              {service.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {service.nameAr && (
            <p className="text-muted-foreground" dir="rtl">
              {service.nameAr}
            </p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href={`/center/services/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Service
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{service.price} SAR</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{service.duration} min</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{service.teacherAssignments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {(service.descriptionEn || service.descriptionAr) && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.descriptionEn && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">English</h4>
                <p className="mt-1">{service.descriptionEn}</p>
              </div>
            )}
            {service.descriptionAr && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Arabic</h4>
                <p className="mt-1" dir="rtl">
                  {service.descriptionAr}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Teacher Assignments</CardTitle>
          <CardDescription>
            Manage which teachers can provide this service. Only assigned teachers will appear in
            availability when parents book this service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherAssignmentManager
            serviceId={service.id}
            teachers={teachersWithStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
}
