'use client';

import { skipOnboardingAction } from '@/app/actions/profile';

export function SkipOnboarding({ locale, label }: { locale: string; label: string }) {
  return (
    <button
      onClick={() => skipOnboardingAction(locale)}
      className="text-sm text-muted-foreground underline hover:text-foreground"
    >
      {label}
    </button>
  );
}
