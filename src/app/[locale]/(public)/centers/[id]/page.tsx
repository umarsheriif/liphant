import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header, Footer } from '@/components/layout';
import { Building, MapPin, Star, Phone, Mail, Globe, Clock, CheckCircle, Users, DollarSign, Briefcase } from 'lucide-react';
import { getCenterById } from '@/lib/data/centers';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CenterProfilePage({ params }: PageProps) {
  const { id } = await params;
  const center = await getCenterById(id);

  if (!center) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white shadow-lg">
                {center.logoUrl ? (
                  <img
                    src={center.logoUrl}
                    alt={center.nameEn}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <Building className="h-12 w-12 text-primary" />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <h1 className="text-3xl font-bold">{center.nameEn}</h1>
                  {center.isVerified && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                {center.nameAr && (
                  <p className="mt-1 text-lg text-muted-foreground">{center.nameAr}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-muted-foreground md:justify-start">
                  {center.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {center.city}
                      {center.district && `, ${center.district}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {center.ratingAvg.toFixed(1)} ({center.reviewCount} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {center.centerTeachers.length} teachers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">
                    {center.descriptionEn || 'No description available.'}
                  </p>
                  {center.specializations.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {center.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Services</CardTitle>
                    {center.services.length > 0 && (
                      <Button asChild>
                        <Link href={`/centers/${id}/book`}>Book Now</Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {center.services.length === 0 ? (
                    <p className="text-muted-foreground">No services available yet.</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {center.services.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{service.nameEn}</p>
                              {service.descriptionEn && (
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {service.descriptionEn}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                              <DollarSign className="h-3 w-3" />
                              {service.price} SAR
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {service.duration} min
                            </span>
                          </div>
                          <Button
                            className="mt-3 w-full"
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/centers/${id}/book?service=${service.id}`}>
                              Book This Service
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Teachers */}
              <Card>
                <CardHeader>
                  <CardTitle>Our Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  {center.centerTeachers.length === 0 ? (
                    <p className="text-muted-foreground">No teachers listed yet.</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {center.centerTeachers.map((ct) => (
                        <div
                          key={ct.id}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <Avatar>
                            <AvatarImage src={ct.teacher.user.avatarUrl || undefined} />
                            <AvatarFallback>
                              {ct.teacher.user.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{ct.teacher.user.fullName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {ct.role.replace('_', ' ')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/teachers/${ct.teacher.userId}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {center.centerReviews.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {center.centerReviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.parent.avatarUrl || undefined} />
                              <AvatarFallback>
                                {review.parent.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{review.parent.fullName}</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {center.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{center.phone}</span>
                    </div>
                  )}
                  {center.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{center.email}</span>
                    </div>
                  )}
                  {center.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={center.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {center.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>{center.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTA */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Interested in this center?
                  </p>
                  {center.services.length > 0 ? (
                    <Button className="mt-4 w-full" asChild>
                      <Link href={`/centers/${id}/book`}>Book a Service</Link>
                    </Button>
                  ) : (
                    <Button className="mt-4 w-full" variant="outline">
                      Contact Center
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
