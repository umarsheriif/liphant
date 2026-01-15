'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/brand';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  user?: { id: string; role?: string } | null;
}

export function Header({ user }: HeaderProps) {
  const t = useTranslations('nav');
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/teachers', label: t('teachers') },
    { href: '/centers', label: t('centers') },
    { href: '/community', label: t('community') },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo variant="header" size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {user ? (
            <Button asChild>
              <Link href="/dashboard">{t('dashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{t('login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t('register')}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 pt-6">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-3 border-t pt-6">
                  {user ? (
                    <Button asChild>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        {t('dashboard')}
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          {t('login')}
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          {t('register')}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
