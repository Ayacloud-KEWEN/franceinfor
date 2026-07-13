import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { parseProfile } from '@/lib/profile';
import { ProfileForm } from '@/components/onboarding/profile-form';
import { SkipOnboarding } from '@/components/onboarding/skip-onboarding';
import { Compass } from 'lucide-react';

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, user] = await Promise.all([getTranslations('onboarding'), getCurrentUser()]);
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <ProfileForm initial={parseProfile(user)} context="onboarding" />

      <div className="mt-4 text-center">
        <SkipOnboarding locale={locale} label={t('skip')} />
      </div>
    </div>
  );
}
