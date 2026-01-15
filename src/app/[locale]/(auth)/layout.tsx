import Link from 'next/link';
import { LanguageSwitcher } from '@/components/layout';
import { Logo } from '@/components/brand';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <header className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center">
            <Logo variant="header" size="md" />
          </Link>
          <LanguageSwitcher />
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden bg-gradient-to-br from-[#7B8CDE] via-[#7B8CDE]/90 to-[#D4E79E] lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center text-white">
          <div className="mb-8 flex justify-center">
            <Logo variant="footer" size="xl" />
          </div>
          <h2 className="mb-4 text-3xl font-bold">Where every child flourishes</h2>
          <p className="text-white/80">
            Connect with qualified shadow teachers and therapy centers to support
            your child&apos;s unique journey
          </p>
        </div>
      </div>
    </div>
  );
}
