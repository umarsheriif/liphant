import { Header, Footer } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Contact Us</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We&apos;re here to help. Reach out to us with any questions or feedback.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Your last name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="flex items-start gap-4 pt-6">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">support@liphant.co</p>
                    <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start gap-4 pt-6">
                  <Phone className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">+20 2 1234 5678</p>
                    <p className="text-sm text-muted-foreground">Sun-Thu, 9am-6pm (Cairo Time)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start gap-4 pt-6">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-muted-foreground">Cairo, Egypt</p>
                    <p className="text-sm text-muted-foreground">Smart Village, Building B2</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start gap-4 pt-6">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Live Chat</h3>
                    <p className="text-muted-foreground">Available on the platform</p>
                    <p className="text-sm text-muted-foreground">For registered users</p>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Promo */}
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="font-semibold">Looking for quick answers?</h3>
                  <p className="mt-2 text-muted-foreground">
                    Check out our FAQ page for answers to common questions about Liphant.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href="/faq">Visit FAQ</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
