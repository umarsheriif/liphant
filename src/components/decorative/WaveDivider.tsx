import { cn } from '@/lib/utils';

interface WaveDividerProps {
  variant?: 'primary' | 'muted' | 'background';
  flip?: boolean;
  className?: string;
}

export function WaveDivider({ variant = 'muted', flip = false, className }: WaveDividerProps) {
  const fillColor = {
    primary: 'fill-primary/5',
    muted: 'fill-muted/50',
    background: 'fill-background',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute left-0 right-0 w-full overflow-hidden leading-none pointer-events-none',
        flip ? 'top-0 rotate-180' : 'bottom-0',
        className
      )}
    >
      <svg
        className={cn('relative block w-full h-16 md:h-24', fillColor[variant])}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
      </svg>
    </div>
  );
}
