import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getCenterServiceById } from '@/lib/data/center-services';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EditServiceForm } from '@/components/center/EditServiceForm';

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'center_admin') {
    redirect('/login');
  }

  const centerProfile = await prisma.centerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!centerProfile) {
    redirect('/center/profile');
  }

  const service = await getCenterServiceById(id);

  if (!service || service.centerId !== centerProfile.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/center/services/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Service</h1>
          <p className="text-muted-foreground">Update service details and pricing</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Modify the service information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditServiceForm service={service} />
        </CardContent>
      </Card>
    </div>
  );
}
