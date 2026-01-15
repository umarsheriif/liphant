import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Phone, Mail, Globe, Clock, Edit } from 'lucide-react';
import Link from 'next/link';

export default async function CenterProfilePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'center_admin') {
    redirect('/login');
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Center Profile</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No center profile found. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const operatingHours = centerProfile.operatingHours as Record<string, { open: string; close: string }> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{centerProfile.nameEn}</h1>
          {centerProfile.nameAr && (
            <p className="text-muted-foreground">{centerProfile.nameAr}</p>
          )}
        </div>
        <Link href="/center/profile/edit">
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Center Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={centerProfile.isVerified ? 'default' : 'secondary'}>
                {centerProfile.isVerified ? 'Verified' : 'Pending Verification'}
              </Badge>
            </div>
            {centerProfile.descriptionEn && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{centerProfile.descriptionEn}</p>
              </div>
            )}
            {centerProfile.specializations.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {centerProfile.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {centerProfile.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p>{centerProfile.address}</p>
                  {centerProfile.city && centerProfile.district && (
                    <p className="text-sm text-muted-foreground">
                      {centerProfile.district}, {centerProfile.city}
                    </p>
                  )}
                </div>
              </div>
            )}
            {centerProfile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p>{centerProfile.phone}</p>
              </div>
            )}
            {centerProfile.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p>{centerProfile.email}</p>
              </div>
            )}
            {centerProfile.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={centerProfile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {centerProfile.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {operatingHours ? (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                  const hours = operatingHours[day];
                  return (
                    <div key={day} className="flex justify-between rounded-lg border p-3">
                      <span className="font-medium capitalize">{day}</span>
                      <span className="text-muted-foreground">
                        {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No operating hours set</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
            <CardDescription>Services and pricing information</CardDescription>
          </CardHeader>
          <CardContent>
            {centerProfile.servicesOffered && Array.isArray(centerProfile.servicesOffered) && centerProfile.servicesOffered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(centerProfile.servicesOffered as Array<{ nameEn: string; nameAr?: string; price: number; duration: number }>).map((service, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h4 className="font-medium">{service.nameEn}</h4>
                    {service.nameAr && <p className="text-sm text-muted-foreground">{service.nameAr}</p>}
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-primary font-semibold">{service.price} EGP</span>
                      <span className="text-muted-foreground">{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No services added yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
