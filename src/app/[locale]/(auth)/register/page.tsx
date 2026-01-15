'use client';

import { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register, type AuthState } from '../actions';
import { Loader2, User, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';

function RegisterFormContent() {
  const t = useTranslations('auth.register');
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || '';

  const [selectedRole, setSelectedRole] = useState(defaultRole);

  useEffect(() => {
    if (defaultRole) {
      setSelectedRole(defaultRole);
    }
  }, [defaultRole]);

  const initialState: AuthState = {};
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName">{t('name')}</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+20 xxx xxx xxxx"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('role')}</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('parent')}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                selectedRole === 'parent'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <User className="h-6 w-6" />
              <span className="text-sm font-medium">{t('roleParent')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                selectedRole === 'teacher'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <GraduationCap className="h-6 w-6" />
              <span className="text-sm font-medium">{t('roleTeacher')}</span>
            </button>
          </div>
          <input type="hidden" name="role" value={selectedRole} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            disabled={isPending}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending || !selectedRole}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            t('submit')
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {t('terms')}{' '}
          <Link href="/terms" className="text-primary hover:underline">
            {t('termsLink')}
          </Link>{' '}
          &{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            {t('privacyLink')}
          </Link>
        </p>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t('hasAccount')} </span>
        <Link href="/login" className="text-primary hover:underline">
          {t('login')}
        </Link>
      </div>
    </div>
  );
}

function RegisterFormLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormLoading />}>
      <RegisterFormContent />
    </Suspense>
  );
}
