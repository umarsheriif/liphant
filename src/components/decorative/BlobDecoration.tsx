import { cn } from '@/lib/utils';

interface BlobDecorationProps {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
  xl: 'w-96 h-96',
};

const variantClasses = {
  primary: 'from-primary/15 to-[#D6E6FF]/10',
  secondary: 'from-secondary/20 to-[#E8F4C8]/15',
  accent: 'from-accent/15 to-[#FFD4D4]/10',
};

export function BlobDecoration({
  variant = 'primary',
  size = 'lg',
  className,
  animate = true,
}: BlobDecorationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute bg-gradient-to-br rounded-[60%_40%_70%_30%_/_40%_50%_60%_50%] blur-3xl pointer-events-none',
        sizeClasses[size],
        variantClasses[variant],
        animate && 'animate-blob',
        className
      )}
    />
  );
}
