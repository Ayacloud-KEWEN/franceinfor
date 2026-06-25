import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  tone = 'muted',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'muted' | 'primary' | 'accent' | 'warning';
}) {
  const tones = {
    muted: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/15 text-accent',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function ScorePill({ score }: { score: number }) {
  const tone = score >= 75 ? 'accent' : score >= 55 ? 'primary' : 'warning';
  return <Badge tone={tone}>{score}</Badge>;
}
