import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Star, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getCenterByUserId, getCenterTeachers } from '@/lib/data/centers';
import Link from 'next/link';

export default async function CenterDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'center_admin') {
    redirect('/login');
  }

  const center = await getCenterByUserId(session.user.id);

  if (!center) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Center Dashboard</h1>
          <p className="text-muted-foreground">Complete your center profile to get started</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Profile Incomplete</h3>
            <p className="mt-2 text-muted-foreground">
              Please complete your center profile to start managing your team.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/center/profile">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teachers = await getCenterTeachers(center.id);

  const stats = [
    {
      title: 'Teachers',
      value: center._count.centerTeachers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Reviews',
      value: center._count.centerReviews,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Rating',
      value: center.ratingAvg.toFixed(1),
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {center.nameEn}</h1>
          <p className="text-muted-foreground">Manage your therapy center</p>
        </div>
        {!center.isVerified && (
          <Badge variant="outline" className="text-yellow-600">
            Pending Verification
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <p className="text-muted-foreground">No teachers added yet.</p>
            ) : (
              <div className="space-y-2">
                {teachers.slice(0, 3).map((ct) => (
                  <div key={ct.id} className="flex items-center justify-between">
                    <span>{ct.teacher.user.fullName}</span>
                    <Badge variant="secondary" className="capitalize">
                      {ct.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Button variant="link" className="mt-4 h-auto p-0" asChild>
              <Link href="/center/teachers">
                Manage teachers <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Center Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {center.descriptionEn
                ? center.descriptionEn.slice(0, 100) + '...'
                : 'Add a description to help parents find your center.'}
            </p>
            <Button variant="link" className="mt-4 h-auto p-0" asChild>
              <Link href="/center/profile">
                Edit profile <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
