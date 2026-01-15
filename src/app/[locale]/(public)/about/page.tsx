import { Header, Footer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Shield, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold md:text-5xl">About Liphant</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Connecting families with qualified professionals to support children with special needs on their unique journey.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                At Liphant, we believe every child deserves the opportunity to flourish. Our platform bridges the gap between families seeking specialized support and qualified shadow teachers and therapy centers dedicated to helping children reach their full potential.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Our Values</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">Compassion</h3>
                  <p className="mt-2 text-muted-foreground">
                    We approach every family&apos;s journey with empathy and understanding.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">Trust</h3>
                  <p className="mt-2 text-muted-foreground">
                    All professionals are verified to ensure safety and quality.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">Community</h3>
                  <p className="mt-2 text-muted-foreground">
                    Building a supportive network of families and professionals.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">Excellence</h3>
                  <p className="mt-2 text-muted-foreground">
                    Committed to providing the highest quality service and support.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold">Our Story</h2>
              <div className="mt-8 space-y-4 text-muted-foreground">
                <p>
                  Liphant was born from a simple observation: families with children who have special needs often struggle to find qualified, trustworthy professionals. The search can be overwhelming, time-consuming, and emotionally draining.
                </p>
                <p>
                  We created Liphant to simplify this journey. Our platform brings together verified shadow teachers, speech therapists, occupational therapists, and therapy centers in one place, making it easy for parents to find the right support for their children.
                </p>
                <p>
                  Beyond just connecting families with professionals, we&apos;ve built a community where parents can share experiences, find support, and celebrate their children&apos;s achievements together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 text-center md:grid-cols-4">
              <div>
                <div className="text-4xl font-bold">500+</div>
                <div className="mt-2 text-primary-foreground/80">Verified Teachers</div>
              </div>
              <div>
                <div className="text-4xl font-bold">50+</div>
                <div className="mt-2 text-primary-foreground/80">Therapy Centers</div>
              </div>
              <div>
                <div className="text-4xl font-bold">2,000+</div>
                <div className="mt-2 text-primary-foreground/80">Families Helped</div>
              </div>
              <div>
                <div className="text-4xl font-bold">10,000+</div>
                <div className="mt-2 text-primary-foreground/80">Sessions Booked</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
