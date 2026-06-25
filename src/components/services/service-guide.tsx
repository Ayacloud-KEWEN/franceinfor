import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Tag, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { LeadForm } from './lead-form';

// "如何在法国注册公司 / 商标" 增值服务板块。
// 合作伙伴办理链接通过 env 配置，未配置则为占位（#）。
export async function ServiceGuide({ kind }: { kind: 'company' | 'brand' }) {
  const t = await getTranslations('services');
  const isCompany = kind === 'company';

  const title = isCompany ? t('companyTitle') : t('brandTitle');
  const intro = isCompany ? t('companyIntro') : t('brandIntro');
  const time = isCompany ? t('companyTime') : t('brandTime');
  const steps = t.raw(isCompany ? 'companySteps' : 'brandSteps') as string[];
  const Icon = isCompany ? Building2 : Tag;

  const href =
    (isCompany
      ? process.env.NEXT_PUBLIC_PARTNER_COMPANY_URL
      : process.env.NEXT_PUBLIC_PARTNER_BRAND_URL) ||
    process.env.NEXT_PUBLIC_PARTNER_URL ||
    '#';

  return (
    <Card className="mt-8 overflow-hidden border-accent/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge tone="accent" className="inline-flex items-center gap-1">
            <Sparkles size={12} /> {t('sectionLabel')}
          </Badge>
        </div>
        <CardTitle className="mt-2 flex items-center gap-2 text-base text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Icon size={16} />
          </span>
          {title}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{intro}</p>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <Clock size={13} className="text-muted-foreground" /> {t('time')}: <b>{time}</b>
          </span>
        </div>

        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('steps')}</div>
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-3">
          <p className="text-sm text-muted-foreground">{t('partnerNote')}</p>
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
            <Button variant="accent" size="sm" className="mt-2">
              {t('ctaPartner')} <ArrowRight size={14} />
            </Button>
          </a>

          <div className="mt-4 border-t border-accent/20 pt-3">
            <LeadForm kind={isCompany ? 'COMPANY' : 'BRAND'} />
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">{t('disclaimer')}</p>
      </CardContent>
    </Card>
  );
}
