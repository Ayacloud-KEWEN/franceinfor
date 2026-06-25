import { getTranslations } from 'next-intl/server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('brand');
  return (
    <div className="flex min-h-screen">
      {/* Left: brand visual panel (hidden on small screens) */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/login.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-900/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={t('name')} className="h-11 w-11 rounded-xl object-contain" />
            <span className="text-xl font-semibold tracking-tight">{t('name')}</span>
          </div>
          <div>
            <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">{t('tagline')}</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">{t('subtagline')}</p>
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} {t('name')}</p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={t('name')} className="h-10 w-10 rounded-lg object-contain" />
            <span className="text-lg font-semibold tracking-tight">{t('name')}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
