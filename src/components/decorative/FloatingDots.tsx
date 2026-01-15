'use client';

import { cn } from '@/lib/utils';

interface FloatingDotsProps {
  count?: number;
  className?: string;
}

const dotPositions = [
  { top: '10%', left: '5%', size: 'w-3 h-3', delay: '0s', color: 'bg-primary/30' },
  { top: '20%', right: '10%', size: 'w-2 h-2', delay: '1s', color: 'bg-secondary/40' },
  { top: '60%', left: '8%', size: 'w-4 h-4', delay: '2s', color: 'bg-accent/25' },
  { top: '75%', right: '15%', size: 'w-2 h-2', delay: '0.5s', color: 'bg-primary/20' },
  { top: '40%', right: '5%', size: 'w-3 h-3', delay: '1.5s', color: 'bg-secondary/30' },
  { top: '85%', left: '20%', size: 'w-2 h-2', delay: '2.5s', color: 'bg-accent/35' },
  { top: '30%', left: '15%', size: 'w-2 h-2', delay: '3s', color: 'bg-primary/25' },
];

export function FloatingDots({ count = 5, className }: FloatingDotsProps) {
  const dots = dotPositions.slice(0, count);

  return (
    <div aria-hidden="true" className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {dots.map((dot, index) => (
        <div
          key={index}
          className={cn(
            'absolute rounded-full animate-float',
            dot.size,
            dot.color
          )}
          style={{
            top: dot.top,
            left: dot.left,
            right: dot.right,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}
