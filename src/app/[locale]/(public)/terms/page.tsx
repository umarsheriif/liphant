import { Header, Footer } from '@/components/layout';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="mt-2 text-muted-foreground">Last updated: January 2026</p>

            <div className="mt-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
                <p className="mt-4 text-muted-foreground">
                  By accessing and using Liphant (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">2. Description of Service</h2>
                <p className="mt-4 text-muted-foreground">
                  Liphant is an online platform that connects families with shadow teachers, therapists, and therapy centers specializing in special needs support. We facilitate the discovery, communication, and booking process between service providers and families.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">3. User Accounts</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>To use certain features of the Platform, you must create an account. You agree to:</p>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>Be responsible for all activities under your account</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">4. Service Providers</h2>
                <p className="mt-4 text-muted-foreground">
                  Teachers and therapy centers on our platform are independent contractors, not employees of Liphant. While we verify credentials and conduct background checks, we do not guarantee the quality of services provided. Parents are encouraged to conduct their own due diligence.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">5. Bookings and Payments</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>When booking sessions through Liphant:</p>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>All payments are processed securely through our platform</li>
                    <li>Cancellation policies vary by provider and will be displayed at booking</li>
                    <li>Liphant charges a service fee for facilitating bookings</li>
                    <li>Refunds are handled according to our refund policy</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">6. User Conduct</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>You agree not to:</p>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Use the platform for any unlawful purpose</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Post false or misleading information</li>
                    <li>Attempt to circumvent our booking system</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
                <p className="mt-4 text-muted-foreground">
                  All content on Liphant, including logos, text, graphics, and software, is the property of Liphant or its licensors and is protected by intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
                <p className="mt-4 text-muted-foreground">
                  Liphant is not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or services booked through it. Our liability is limited to the amount paid for services through our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">9. Changes to Terms</h2>
                <p className="mt-4 text-muted-foreground">
                  We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">10. Contact Us</h2>
                <p className="mt-4 text-muted-foreground">
                  If you have questions about these Terms of Service, please contact us at legal@liphant.co.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
