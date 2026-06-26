import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/forgot-password-form';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth');
  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">{t('forgotTitle')}</h2>
      <ForgotPasswordForm />
    </div>
  );
}
