import { Header, Footer } from '@/components/layout';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="mt-2 text-muted-foreground">Last updated: January 2026</p>

            <div className="mt-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
                <div className="mt-4 space-y-4 text-muted-foreground">
                  <p><strong>Personal Information:</strong> When you create an account, we collect your name, email address, phone number, and role (parent, teacher, or center admin).</p>
                  <p><strong>Profile Information:</strong> Depending on your role, we collect additional information such as specializations, experience, location, and service details.</p>
                  <p><strong>Usage Data:</strong> We automatically collect information about how you interact with our platform, including pages visited and features used.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>We use your information to:</p>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Provide and improve our services</li>
                    <li>Connect families with appropriate service providers</li>
                    <li>Process bookings and payments</li>
                    <li>Send important updates and notifications</li>
                    <li>Ensure platform safety and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">3. Information Sharing</h2>
                <div className="mt-4 space-y-4 text-muted-foreground">
                  <p>We may share your information with:</p>
                  <ul className="ml-6 list-disc space-y-1">
                    <li><strong>Other Users:</strong> Profile information is visible to facilitate connections</li>
                    <li><strong>Service Providers:</strong> Third parties who help us operate the platform</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                  </ul>
                  <p>We do not sell your personal information to third parties.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">4. Data Security</h2>
                <p className="mt-4 text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal information. This includes encryption, secure servers, and regular security assessments. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">5. Your Rights</h2>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>You have the right to:</p>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Export your data</li>
                    <li>Opt-out of marketing communications</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">6. Children&apos;s Privacy</h2>
                <p className="mt-4 text-muted-foreground">
                  While our platform helps families with children who have special needs, we do not knowingly collect personal information directly from children under 13. All account holders must be adults. Information about children is provided by their parents or guardians.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">7. Cookies and Tracking</h2>
                <p className="mt-4 text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze platform usage. You can control cookie settings through your browser, though some features may not function properly without them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">8. Data Retention</h2>
                <p className="mt-4 text-muted-foreground">
                  We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data as required by law or for legitimate business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">9. International Transfers</h2>
                <p className="mt-4 text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold">10. Contact Us</h2>
                <p className="mt-4 text-muted-foreground">
                  For privacy-related questions or to exercise your rights, contact us at privacy@liphant.co.
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
