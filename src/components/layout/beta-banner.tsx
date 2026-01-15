'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export function BetaBanner() {
  const t = useTranslations('beta');

  return (
    <div className="bg-yellow-500 text-yellow-950 px-4 py-2">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>{t('message')}</span>
      </div>
    </div>
  );
}
