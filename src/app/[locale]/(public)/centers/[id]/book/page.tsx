import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getCenterById } from '@/lib/data/centers';
import { getCenterServices } from '@/lib/data/center-services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header, Footer } from '@/components/layout';
import { ArrowLeft, Building, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CenterBookingForm } from '@/components/booking/CenterBookingForm';

interface BookingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ service?: string }>;
}

export default async function CenterBookingPage({ params, searchParams }: BookingPageProps) {
  const { id } = await params;
  const { service: selectedServiceId } = await searchParams;

  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect(`/login?callbackUrl=/centers/${id}/book`);
  }

  // Only parents can book
  if (session.user.role !== 'parent') {
    redirect(`/centers/${id}`);
  }

  const center = await getCenterById(id);

  if (!center) {
    notFound();
  }

  // Get active services for this center
  const services = await getCenterServices(center.id, false);
  const activeServices = services.filter((s) => s.isActive);

  // Check if parent has a profile
  const parentProfile = await (await import('@/lib/prisma')).default.parentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!parentProfile) {
    redirect('/parent/profile?setup=true');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/centers/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Center
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main booking form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Book a Service</CardTitle>
                  <CardDescription>
                    Select a service and choose your preferred date and time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeServices.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        This center doesn&apos;t have any services available for booking at the moment.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href={`/centers/${id}`}>Back to Center</Link>
                      </Button>
                    </div>
                  ) : (
                    <CenterBookingForm
                      centerId={center.id}
                      services={activeServices}
                      selectedServiceId={selectedServiceId}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Center info sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {center.logoUrl ? (
                        <img
                          src={center.logoUrl}
                          alt={center.nameEn}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-semibold">{center.nameEn}</p>
                        {center.isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {center.city && (
                        <p className="text-sm text-muted-foreground">{center.city}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Booking Info</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>A qualified teacher will be assigned by the center</li>
                    <li>You&apos;ll receive a confirmation once assigned</li>
                    <li>Free cancellation up to 24 hours before</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
