import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function TeachersPage() {
  const pendingApplications = await prisma.teacherApplication.findMany({
    where: { status: 'pending' },
    orderBy: { submittedAt: 'desc' },
    include: {
      user: {
        select: { fullName: true, email: true, avatarUrl: true },
      },
    },
  });

  const unverifiedTeachers = await prisma.teacherProfile.findMany({
    where: { isVerified: false },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Verification</h1>
        <p className="text-muted-foreground">
          Review and verify teacher applications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Pending Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending applications
            </p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">{app.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{app.user.email}</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unverified Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          {unverifiedTeachers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              All teachers are verified
            </p>
          ) : (
            <div className="space-y-4">
              {unverifiedTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">{teacher.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.experienceYears} years experience
                    </p>
                  </div>
                  <Badge variant="outline">Unverified</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
