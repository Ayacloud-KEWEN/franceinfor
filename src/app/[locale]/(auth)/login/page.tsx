import { getTranslations } from 'next-intl/server';
import { AuthForm } from '@/components/auth-form';

export default async function LoginPage() {
  const t = await getTranslations('auth');
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">{t('signInTitle')}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t('demoHint')}</p>
      <AuthForm mode="login" />
    </div>
  );
}
