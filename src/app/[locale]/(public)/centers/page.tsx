import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header, Footer } from '@/components/layout';
import { Building, MapPin, Star, Users, Search, CheckCircle } from 'lucide-react';
import { getCenters, getCenterCities } from '@/lib/data/centers';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
  }>;
}

export default async function CentersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const centers = await getCenters({
    search: params.q,
    city: params.city,
  });
  const cities = await getCenterCities();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">Find Therapy Centers</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Discover specialized therapy centers in your area offering comprehensive services for children with special needs.
            </p>

            {/* Search Form */}
            <form className="mx-auto mt-8 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search centers..."
                  defaultValue={params.q}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </section>

        {/* Centers Grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              {centers.length} center{centers.length !== 1 ? 's' : ''} found
            </p>
            {cities.length > 0 && (
              <div className="flex gap-2">
                {cities.slice(0, 5).map((city) => (
                  <Badge
                    key={city}
                    variant={params.city === city ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    asChild
                  >
                    <Link href={`/centers?city=${city}`}>{city}</Link>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {centers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No centers found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {centers.map((center) => (
                <Card key={center.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                        {center.logoUrl ? (
                          <img
                            src={center.logoUrl}
                            alt={center.nameEn}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{center.nameEn}</h3>
                          {center.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {center.city && (
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {center.city}
                            {center.district && `, ${center.district}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {center.descriptionEn && (
                      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                        {center.descriptionEn}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1">
                      {center.specializations.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {center.specializations.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{center.specializations.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {center.ratingAvg.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {center.teacherCount} teachers
                        </span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/centers/${center.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
