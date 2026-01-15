import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Clock, AlertCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import {
  TeacherApproveButton,
  TeacherRejectButton,
  ApplicationApproveButton,
  ApplicationRejectButton,
} from './teacher-actions';

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
    orderBy: { user: { createdAt: 'desc' } },
  });

  const verifiedTeachersCount = await prisma.teacherProfile.count({
    where: { isVerified: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Verification</h1>
        <p className="text-muted-foreground">
          Review and verify teacher applications and profiles
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingApplications.length}</p>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unverifiedTeachers.length}</p>
                <p className="text-sm text-muted-foreground">Unverified Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedTeachersCount}</p>
                <p className="text-sm text-muted-foreground">Verified Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
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
                <div
                  key={app.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {app.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{app.user.fullName}</p>
                      <p className="text-sm text-muted-foreground">{app.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Pending</Badge>
                    <ApplicationApproveButton applicationId={app.id} />
                    <ApplicationRejectButton applicationId={app.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unverified Teachers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Unverified Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unverifiedTeachers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              All teachers are verified
            </p>
          ) : (
            <div className="space-y-4">
              {unverifiedTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {teacher.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{teacher.user.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.experienceYears} years experience | {teacher.city || 'No city'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {teacher.specializations.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Unverified</Badge>
                    <TeacherApproveButton teacherId={teacher.id} />
                    <TeacherRejectButton teacherId={teacher.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
