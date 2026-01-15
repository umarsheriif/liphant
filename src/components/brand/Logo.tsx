'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'header' | 'footer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { height: 24, width: 80 },
  md: { height: 32, width: 110 },
  lg: { height: 40, width: 140 },
  xl: { height: 48, width: 170 },
};

/**
 * LiPhant Logo Component
 * - header variant: Dark logo for light backgrounds (header, sidebar)
 * - footer variant: Light logo for dark backgrounds (footer, colored sections)
 */
export function Logo({ variant = 'header', size = 'md', className }: LogoProps) {
  const dimensions = sizes[size];
  const logoSrc = variant === 'header' ? '/logo-header.png' : '/logo-footer.png';

  return (
    <Image
      src={logoSrc}
      alt="LiPhant"
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority
    />
  );
}

export function LogoText({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold text-[#333333]', className)}>
      LiPhant
    </span>
  );
}
