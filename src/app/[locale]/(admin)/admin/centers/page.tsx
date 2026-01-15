import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import prisma from '@/lib/prisma';
import { CenterApproveButton, CenterRejectButton } from './center-actions';

export default async function CentersPage() {
  const unverifiedCenters = await prisma.centerProfile.findMany({
    where: { isVerified: false },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
      _count: {
        select: { centerTeachers: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const verifiedCentersCount = await prisma.centerProfile.count({
    where: { isVerified: true },
  });

  const totalCentersCount = await prisma.centerProfile.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Center Verification</h1>
        <p className="text-muted-foreground">
          Review and verify therapy center profiles
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCentersCount}</p>
                <p className="text-sm text-muted-foreground">Total Centers</p>
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
                <p className="text-2xl font-bold">{unverifiedCenters.length}</p>
                <p className="text-sm text-muted-foreground">Unverified Centers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedCentersCount}</p>
                <p className="text-sm text-muted-foreground">Verified Centers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unverified Centers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Unverified Centers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unverifiedCenters.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              All centers are verified
            </p>
          ) : (
            <div className="space-y-4">
              {unverifiedCenters.map((center) => (
                <div
                  key={center.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{center.nameEn || center.nameAr || 'Unnamed Center'}</p>
                      <p className="text-sm text-muted-foreground">
                        {center.city || 'No city'} | {center._count.centerTeachers} therapists
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Admin: {center.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Unverified</Badge>
                    <CenterApproveButton centerId={center.id} />
                    <CenterRejectButton centerId={center.id} />
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
