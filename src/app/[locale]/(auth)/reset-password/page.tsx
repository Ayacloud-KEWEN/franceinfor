import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/reset-password-form';

export default async function ResetPasswordPage() {
  const t = await getTranslations('auth');
  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">{t('resetTitle')}</h2>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
