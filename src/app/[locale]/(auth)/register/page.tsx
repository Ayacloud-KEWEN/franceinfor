import { getTranslations } from 'next-intl/server';
import { AuthForm } from '@/components/auth-form';

export default async function RegisterPage() {
  const t = await getTranslations('auth');
  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">{t('signUpTitle')}</h2>
      <AuthForm mode="register" />
    </div>
  );
}
