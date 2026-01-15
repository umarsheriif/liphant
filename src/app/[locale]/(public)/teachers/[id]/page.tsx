import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  GraduationCap,
  Award,
  Calendar,
  MessageCircle,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { getTeacherById, getTeacherReviews } from '@/lib/data/teachers';
import type { Specialization } from '@prisma/client';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function TeacherProfilePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('teacher.profile');
  const tSpec = await getTranslations('specializations');

  // Fetch teacher from database
  const teacher = await getTeacherById(id);

  if (!teacher) {
    notFound();
  }

  // Fetch reviews
  const reviews = await getTeacherReviews(teacher.userId);

  // Group availabilities by day
  const availabilityByDay = teacher.availabilities.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(`${slot.startTime} - ${slot.endTime}`);
    return acc;
  }, {} as Record<number, string[]>);

  const bio = locale === 'ar' ? teacher.bioAr : teacher.bioEn;
  const initials = teacher.user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const isRTL = locale === 'ar';

  // Parse certifications from JSON
  const certifications = (teacher.certifications as { name: string; issuer: string; year: number }[]) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            href="/teachers"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            Back to Teachers
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Profile Header */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage
                          src={teacher.user.avatarUrl || undefined}
                          alt={teacher.user.fullName}
                        />
                        <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {teacher.isVerified && (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-accent p-1.5">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold">{teacher.user.fullName}</h1>
                        {teacher.isVerified && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="mb-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                        {teacher.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {teacher.city}{teacher.district && `, ${teacher.district}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {teacher.experienceYears} years experience
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-secondary text-secondary" />
                          <span className="text-lg font-semibold">
                            {teacher.ratingAvg > 0 ? teacher.ratingAvg.toFixed(1) : 'New'}
                          </span>
                          {teacher.reviewCount > 0 && (
                            <span className="text-muted-foreground">
                              ({teacher.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="text-xl font-bold text-primary">
                          {teacher.hourlyRate} EGP
                          <span className="text-sm font-normal text-muted-foreground">
                            /hour
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="about">{t('about')}</TabsTrigger>
                  <TabsTrigger value="reviews">{t('reviews')}</TabsTrigger>
                  <TabsTrigger value="availability">{t('availability')}</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  {/* About */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('about')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {bio || 'No bio available.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Specializations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('specializations')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {teacher.specializations.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-sm">
                            {tSpec(spec as Specialization)}
                          </Badge>
                        ))}
                        {teacher.specializations.length === 0 && (
                          <p className="text-muted-foreground">No specializations listed.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Education & Certifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('education')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {teacher.education && (
                        <div className="flex items-start gap-3">
                          <GraduationCap className="mt-0.5 h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{teacher.education}</p>
                          </div>
                        </div>
                      )}
                      {certifications.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-3 font-medium">{t('certifications')}</h4>
                          <div className="space-y-2">
                            {certifications.map((cert, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <Award className="mt-0.5 h-5 w-5 text-accent" />
                                <div>
                                  <p className="font-medium">{cert.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {cert.issuer} - {cert.year}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!teacher.education && certifications.length === 0 && (
                        <p className="text-muted-foreground">No education information available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.parent.avatarUrl || undefined} />
                                <AvatarFallback>
                                  {review.parent.fullName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {review.parent.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-secondary text-secondary'
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">{t('noReviews')}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="availability">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('availability')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {DAYS.map((day, index) => (
                          <div
                            key={day}
                            className="flex items-center justify-between border-b py-3 last:border-0"
                          >
                            <span className="font-medium">{day}</span>
                            <div className="flex flex-wrap gap-2">
                              {availabilityByDay[index]?.map((slot) => (
                                <Badge key={slot} variant="outline">
                                  {slot}
                                </Badge>
                              )) || (
                                <span className="text-sm text-muted-foreground">
                                  Not available
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Book a Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {teacher.hourlyRate} EGP
                    </p>
                    <p className="text-sm text-muted-foreground">per hour</p>
                  </div>

                  <Button className="w-full gap-2" size="lg" asChild>
                    <Link href={`/teachers/${id}/book`}>
                      <Calendar className="h-4 w-4" />
                      Book Now
                    </Link>
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2" asChild>
                      <Link href={`/messages?teacher=${teacher.userId}`}>
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                    {teacher.user.phone && (
                      <Button variant="outline" className="flex-1 gap-2" asChild>
                        <a href={`tel:${teacher.user.phone}`}>
                          <Phone className="h-4 w-4" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    {teacher.city && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('location')}</span>
                        <span>
                          {teacher.city}{teacher.district && `, ${teacher.district}`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Area</span>
                      <span>{teacher.serviceRadiusKm} km radius</span>
                    </div>
                  </div>
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
