import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Star, MapPin } from 'lucide-react';

export default async function CenterTeachersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'center_admin') {
    redirect('/login');
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      teachers: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  const teachers = centerProfile?.teachers || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage teachers associated with your center</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Teacher
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter((t) => t.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter((t) => t.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
          <CardDescription>All teachers associated with your center</CardDescription>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No teachers yet</h3>
              <p className="text-muted-foreground">Invite teachers to join your center</p>
              <Button className="mt-4">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Teacher
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teachers.map((ct) => (
                <div key={ct.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={ct.teacher.user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {ct.teacher.user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{ct.teacher.user.fullName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {ct.teacher.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ct.teacher.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {ct.teacher.ratingAvg.toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {ct.teacher.specializations.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        ct.status === 'active'
                          ? 'default'
                          : ct.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {ct.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
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
