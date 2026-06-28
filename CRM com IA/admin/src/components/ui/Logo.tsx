import { useTheme } from 'next-themes';
import logoDark from '@/assets/branding/logo-dark.png';
import logoLight from '@/assets/branding/logo-light.png';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { BRANDING } from '@/config/branding';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const { resolvedTheme } = useTheme();

  const logoSrc = useMemo(() => {
    const isDark = resolvedTheme === 'dark' || resolvedTheme === undefined;
    return isDark ? logoDark : logoLight;
  }, [resolvedTheme]);

  const sizeClasses = {
    sm: 'h-16 sm:h-20',
    md: 'h-20 sm:h-24 md:h-28',
    lg: 'h-28 sm:h-32 md:h-40',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={logoSrc}
        alt={BRANDING.platform_name}
        className={cn(sizeClasses[size], 'w-auto')}
      />
    </div>
  );
}
