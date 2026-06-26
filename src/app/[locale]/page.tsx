import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LandingHeader } from '@/components/landing/landing-header';
import { CookieConsent } from '@/components/landing/cookie-consent';
import { Analytics } from '@/components/landing/analytics';
import {
  Building2, Gavel, TrendingUp, Landmark, ClipboardCheck, Bot,
  Check, ArrowRight, Sparkles,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://francego.fr';
// GA4 measurement id is public (exposed in the gtag URL); env can override it.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-DR6YV2QTQN';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing.meta' });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${BASE_URL}/${l}`]));
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `${BASE_URL}/${locale}`, languages },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${BASE_URL}/${locale}`,
      siteName: 'FranceGo',
      type: 'website',
      locale,
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description') },
  };
}

const FEATURE_ICONS = [Building2, Gavel, TrendingUp, Landmark, ClipboardCheck, Bot];

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'landing' });

  const features = t.raw('features.items') as { title: string; desc: string }[];
  const plans = t.raw('pricing.items') as { name: string; price: string; desc: string; features: string[]; cta: string }[];
  const enterprise = t.raw('pricing.enterprise') as { name: string; price: string; desc: string; cta: string };
  const faqs = t.raw('faq.items') as { q: string; a: string }[];

  // Structured data for SEO + AI answer engines.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'FranceGo',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: t('meta.description'),
        url: `${BASE_URL}/${locale}`,
        offers: plans.map((p) => ({
          '@type': 'Offer',
          name: p.name,
          price: p.price.replace(/[^0-9]/g, '') || '0',
          priceCurrency: 'EUR',
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingHeader />

      {/* HERO */}
      <section className="gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge tone="accent" className="inline-flex items-center gap-1">
            <Sparkles size={12} /> {t('hero.badge')}
          </Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">{t('hero.title')}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">{t('hero.ctaPrimary')} <ArrowRight size={16} /></Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline">{t('hero.ctaSecondary')}</Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{t('hero.note')}</p>
        </div>
      </section>

      <p className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-muted-foreground">{t('trust')}</p>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t('features.heading')}</h2>
          <p className="mt-2 text-muted-foreground">{t('features.subheading')}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? Sparkles;
            return (
              <Card key={i} className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </span>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t('pricing.heading')}</h2>
            <p className="mt-2 text-muted-foreground">{t('pricing.subheading')}</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((p, i) => {
              const popular = i === 1;
              return (
                <Card key={p.name} className={`flex flex-col p-6 ${popular ? 'border-primary ring-1 ring-primary' : ''}`}>
                  {popular && <Badge tone="primary" className="mb-2 self-start">{t('pricing.mostPopular')}</Badge>}
                  <div className="font-semibold">{p.name}</div>
                  <div className="mt-1 text-3xl font-bold">
                    {p.price}
                    {p.price !== '€0' && p.price !== '0 €' && (
                      <span className="text-sm font-normal text-muted-foreground">{t('pricing.perMonth')}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {p.features.map((feat, j) => (
                      <li key={j} className="flex gap-2 text-sm">
                        <Check size={15} className="mt-0.5 shrink-0 text-accent" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="mt-5">
                    <Button className="w-full" variant={popular ? 'default' : 'outline'}>{p.cta}</Button>
                  </Link>
                </Card>
              );
            })}
          </div>
          {/* Enterprise */}
          <Card className="mt-5 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <div className="font-semibold">{enterprise.name} · <span className="text-muted-foreground">{enterprise.price}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{enterprise.desc}</p>
            </div>
            <Link href="/register"><Button variant="outline">{enterprise.cta}</Button></Link>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">{t('faq.heading')}</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="rounded-lg border border-border p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="gradient-hero border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">{t('finalCta.title')}</h2>
          <p className="mt-2 text-muted-foreground">{t('finalCta.subtitle')}</p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">{t('finalCta.button')} <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span>{t('footer.tagline')}</span>
          <span>© {new Date().getFullYear()} FranceGo · {t('footer.rights')}</span>
        </div>
      </footer>

      <CookieConsent />
      <Analytics gaId={GA_ID} />
    </div>
  );
}
