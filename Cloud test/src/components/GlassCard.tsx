import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'glow';
  children: React.ReactNode;
}

export function GlassCard({ variant = 'default', className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-6',
        variant === 'default' && 'glass',
        variant === 'strong' && 'glass-strong',
        variant === 'glow' && 'glass glow-primary',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
